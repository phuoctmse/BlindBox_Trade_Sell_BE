import { ObjectId } from 'mongodb'
import { AccountRole, AccountVerifyStatus, TokenType } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'
import databaseServices from './database.services'
import { hashPassword } from '~/utils/crypto'
import Account from '~/models/schemas/Account.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { RegisterReqBody, TokenPayload, UpdateReqMeBody } from '~/models/requests/Account.requests'
import { config } from 'dotenv'
import { StringValue } from 'ms'
import { USER_MESSAGES } from '~/constants/messages'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
config()

class AccountService {
  private signAccessToken({
    accountId,
    verify,
    isSeller
  }: {
    accountId: string
    verify: AccountVerifyStatus
    isSeller: boolean
  }) {
    return signToken({
      payload: {
        accountId,
        token_type: TokenType.AccessToken,
        verify,
        isSeller
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue
      }
    })
  }

  private signRefreshToken({
    accountId,
    verify,
    isSeller,
    exp
  }: {
    accountId: string
    verify: AccountVerifyStatus
    isSeller: boolean
    exp?: number
  }) {
    if (exp) {
      return signToken({
        payload: {
          accountId,
          token_type: TokenType.RefreshToken,
          verify,
          isSeller,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        accountId,
        token_type: TokenType.RefreshToken,
        verify,
        isSeller
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue
      }
    })
  }

  private signEmailVerifyToken(accountId: string) {
    return signToken({
      payload: {
        accountId,
        token_type: TokenType.EmailVerificationToken
      },
      privateKey: process.env.JWT_SECRET_VERIFIED_EMAIL_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as StringValue
      }
    })
  }

  private signForgotPasswordToken(accountId: string) {
    return signToken({
      payload: {
        accountId,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as StringValue
      }
    })
  }

  private async signAccessAndRefreshTokens({
    accountId,
    verify,
    isSeller
  }: {
    accountId: string
    verify: AccountVerifyStatus
    isSeller: boolean
  }) {
    return await Promise.all([
      this.signAccessToken({ accountId, verify, isSeller }),
      this.signRefreshToken({ accountId, verify, isSeller })
    ])
  }

  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async register(payload: RegisterReqBody, isGoogle: boolean) {
    const newAccountId = new ObjectId()
    const accountIdToString = newAccountId.toString()
    const email_verify_token = await this.signEmailVerifyToken(accountIdToString)
    await databaseServices.accounts.insertOne(
      new Account({
        ...payload,
        _id: newAccountId,
        email_verify_token,
        password: hashPassword(payload.password),
        role: AccountRole.User
      })
    )
    if (isGoogle) {
      const isSeller = false
      const [access_token, refresh_token] = await this.signAccessAndRefreshTokens({
        accountId: newAccountId.toString(),
        verify: AccountVerifyStatus.Verified,
        isSeller
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseServices.refreshTokens.insertOne(
        new RefreshToken({
          account_id: ObjectId.createFromHexString(newAccountId.toString()),
          token: refresh_token,
          iat,
          exp
        })
      )
      return {
        message: USER_MESSAGES.REGISTER_SUCCESS,
        access_token,
        refresh_token
      }
    } else {
      return {
        message: USER_MESSAGES.REGISTER_SUCCESS
      }
    }
  }

  async checkUserNameExist(userName: string) {
    const user = await databaseServices.accounts.findOne({ userName })
    return user
  }

  async checkEmailExist(email: string) {
    const user = await databaseServices.accounts.findOne({ email })
    return user
  }

  async login({ accountId, verify, isSeller }: { accountId: string; verify: AccountVerifyStatus; isSeller: boolean }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshTokens({ accountId, verify, isSeller })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(accountId), token: refreshToken, iat, exp })
    )
    return {
      accessToken,
      refreshToken,
      message: USER_MESSAGES.LOGIN_SUCCESS
    }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      refresh_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }
  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.EMAIL_NOT_VERIFIED, status: HTTP_STATUS.BAD_REQUEST })
    }
    const user = await databaseServices.accounts.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshTokens({
        accountId: user._id.toString(),
        verify: user.verify,
        isSeller: user.isRegisterSelling
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseServices.refreshTokens.insertOne(
        new RefreshToken({
          account_id: user._id,
          token: refresh_token,
          iat: iat,
          exp: exp
        })
      )
      return {
        access_token,
        refresh_token,
        newUser: false,
        message: USER_MESSAGES.LOGIN_SUCCESS
      }
    } else {
      const password = Math.random().toString(36).slice(2, 7)
      const data = await this.register(
        {
          email: userInfo.email,
          userName: userInfo.family_name + ' ' + userInfo.given_name,
          password: hashPassword(password),
          phoneNumber: ''
        },
        true
      )
      console.log('data', data)
      return {
        ...data,
        newUser: true,
        message: USER_MESSAGES.REGISTER_SUCCESS
      }
    }
  }

  async logout(refreshToken: string) {
    await databaseServices.refreshTokens.deleteOne({ token: refreshToken })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async refreshToken({
    accountId,
    refresh_token,
    verify,
    exp,
    isSeller
  }: {
    accountId: string
    refresh_token: string
    verify: AccountVerifyStatus
    exp: number
    isSeller: boolean
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ accountId, verify, isSeller }),
      this.signRefreshToken({ accountId, verify, isSeller, exp }),
      databaseServices.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const { iat } = await this.decodeRefreshToken(new_refresh_token)
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(accountId), token: new_refresh_token, iat, exp })
    )
    return {
      accessToken: new_access_token,
      refreshToken: new_refresh_token,
      message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS
    }
  }

  async verifyEmail(accountId: string) {
    await databaseServices.accounts.updateOne({ _id: new ObjectId(accountId) }, [
      {
        $set: {
          email_verify_token: '',
          verify: AccountVerifyStatus.Verified,
          updatedAt: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.EMAIL_VERIFIED_SUCCESS
    }
  }

  async resendVerifyEmail(accountId: string) {
    const email_verify_token = await this.signEmailVerifyToken(accountId)
    await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return {
      message: USER_MESSAGES.EMAIL_VERIFY_RESENT_SUCCESS
    }
  }

  async forgotPassword(email: string) {
    const user = await databaseServices.accounts.findOne({ email })
    if (!user) {
      throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
    }

    const forgotPasswordToken = await this.signForgotPasswordToken(user._id.toString())
    await databaseServices.accounts.updateOne(
      { _id: user._id },
      { $set: { forgot_password_token: forgotPasswordToken } }
    )
    return {
      message: USER_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT
    }
  }

  async verifyForgotPassword(forgot_password_token: string) {
    const decodedToken = (await verifyToken({
      token: forgot_password_token,
      secretKey: process.env.JWT_FORGOT_PASSWORD_TOKEN as string
    })) as TokenPayload

    const accountId = decodedToken.accountId
    const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })
    if (!user) {
      throw new Error(USER_MESSAGES.USER_NOT_FOUND)
    }
    if (!user.forgot_password_token || user.forgot_password_token !== forgot_password_token) {
      throw new Error(USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN)
    }
    await databaseServices.accounts.updateOne({ _id: user._id }, { $set: { forgot_password_token: '' } })

    return { message: USER_MESSAGES.VALID_FORGOT_PASSWORD_TOKEN }
  }

  async resetPassword(accountId: string, password: string, forgot_password_token: string) {
    const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })

    if (!user || user.forgot_password_token !== forgot_password_token) {
      throw new Error(USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN)
    }

    const hashedPassword = hashPassword(password)
    await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { password: hashedPassword, forgot_password_token: '' } }
    )

    return {
      message: USER_MESSAGES.PASSWORD_RESET_SUCCESS
    }
  }

  async verifyPassword(accountId: string, currentPassword: string) {
    const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })
    if (!user) {
      throw new Error(USER_MESSAGES.USER_NOT_FOUND)
    }
    const hashedCurrentPassword = hashPassword(currentPassword)
    const isPasswordValid = user.password === hashedCurrentPassword
    return isPasswordValid
  }

  async changePassword(accountId: string, newPassword: string) {
    const hashedPassword = hashPassword(newPassword)
    const result = await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { password: hashedPassword } }
    )
    if (result.modifiedCount === 0) {
      throw new Error('Failed to update password')
    }
    return {
      message: USER_MESSAGES.PASSWORD_CHANGE_SUCCESS
    }
  }

  async getMe(accountId: string) {
    const account = await databaseServices.accounts.findOne(
      { _id: new ObjectId(accountId) },
      {
        projection: {
          email_verify_token: 0,
          password: 0,
          forgot_password_token: 0
        }
      }
    )
    return account
  }

  async updateMe(accountId: string, payload: UpdateReqMeBody) {
    const account = await databaseServices.accounts.findOneAndUpdate({ _id: new ObjectId(accountId) }, [
      {
        $set: {
          ...payload,
          updatedAt: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.UPDATE_SUCCESS
    }
  }

  async registerSeller(accountId: string) {
    const result = await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { isRegisterSelling: true } }
    )
    if (result.modifiedCount === 0) {
      throw new Error(USER_MESSAGES.USER_NOT_SELLER)
    }
    return {
      message: USER_MESSAGES.REGISTERED_SELLING_SUCCESS
    }
  }
}

const accountService = new AccountService()
export default accountService
