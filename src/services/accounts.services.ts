import { ObjectId } from 'mongodb'
import { AccountRole, TokenType } from '~/constants/enums'
import { signToken } from '~/utils/jwt'
import databaseServices from './database.services'
import { hashPassword } from '~/utils/crypto'
import Account from '~/models/schemas/Account.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { RegisterReqBody } from '~/models/requests/Account.requests'
import { config } from 'dotenv'
import { StringValue } from 'ms'
config()

class AccountService {
  private signAccessToken(accountId: string) {
    return signToken({
      payload: {
        accountId,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue
      }
    })
  }

  private signRefreshToken(accountId: string) {
    return signToken({
      payload: {
        accountId,
        token_type: TokenType.RefreshToken
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

  private async signAccessAnhRefreshTokens(accountId: string) {
    return await Promise.all([this.signAccessToken(accountId), this.signRefreshToken(accountId)])
  }

  async register(payload: RegisterReqBody) {
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
    const [accessToken, refreshToken] = await this.signAccessAnhRefreshTokens(accountIdToString)
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(accountIdToString), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
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

  async login(accountId: string) {
    const [accessToken, refreshToken] = await this.signAccessAnhRefreshTokens(accountId)
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(accountId), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
    }
  }
}

const accountService = new AccountService()
export default accountService
