import { config } from 'dotenv'
import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import {
  EmailVerifyReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  ForgotPasswordReqBody,
  UpdateReqMeBody
} from '~/models/requests/Account.requests'
import Accounts from '~/models/schemas/Account.schema'
import accountService from '~/services/accounts.services'
import databaseServices from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { notifyEmailVerified, notifySellerRegistered } from '~/utils/socket'
config()

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userName, email, password, phoneNumber } = req.body
  const result = await accountService.register({ userName, email, password, phoneNumber }, false)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const account = req.account as Accounts
  const accountId = account._id as ObjectId
  const isSeller = account.isRegisterSelling
  const role = account.role
  const cookiesExpire = process.env.COOKIES_EXPIRES_IN as string
  const result = await accountService.login({ accountId: accountId.toString(), verify: account.verify, isSeller, role })
  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: parseInt(cookiesExpire)
  })
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  if (code === undefined) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: USER_MESSAGES.LOGIN_OAUTH_FAILED
    })
  }
  const result = await accountService.oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_URI}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}`
  const cookiesExpire = process.env.COOKIES_EXPIRES_IN as string
  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: parseInt(cookiesExpire)
  })
  res.redirect(urlRedirect)
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.cookies
  const result = await accountService.logout(refresh_token)
  res.clearCookie('refresh_token')
  res.status(HTTP_STATUS.OK).json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.cookies
  const { accountId, verify, exp, isSeller, role } = req.decoded_refresh_token as TokenPayload
  const cookiesExpire = process.env.COOKIES_EXPIRES_IN as string
  const result = await accountService.refreshToken({ accountId, refresh_token, verify, exp, isSeller, role })
  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: parseInt(cookiesExpire)
  })
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, EmailVerifyReqBody>, res: Response) => {
  const { accountId } = req.decoded_email_verified_token as TokenPayload
  const user = await databaseServices.accounts.findOne({ _id: ObjectId.createFromHexString(accountId) })
  // Check if account is not found
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // Check if account's email is already verified
  if (user?.email_verify_token === '') {
    res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }

  notifyEmailVerified(accountId)

  const result = await accountService.verifyEmail(accountId)
  res.status(HTTP_STATUS.OK).json({
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const user = await databaseServices.accounts.findOne({ _id: ObjectId.createFromHexString(accountId) })
  // Check if user is not found
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // Check if user's email is already verified
  if (user?.email_verify_token === '') {
    res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await accountService.resendVerifyEmail(accountId)
  res.status(HTTP_STATUS.OK).json({
    result
  })
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const account = await accountService.getMe(accountId)
  res.json({
    message: USER_MESSAGES.GET_ME_SUCCESS,
    result: account
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
): Promise<void> => {
  const { email } = req.body
  const result = await accountService.forgotPassword(email)
  res.status(HTTP_STATUS.OK).json({
    result
  })
}

export const verifyForgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  const { forgot_password_token } = req.body
  const decodedToken = req.decoded_forgot_password_token as TokenPayload
  const accountId = decodedToken.accountId
  const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })

  if (!user || user.forgot_password_token !== forgot_password_token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN
    })
    return
  }
  res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.VALID_FORGOT_PASSWORD_TOKEN })
}

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  const { password, confirm_password, forgot_password_token } = req.body
  const decodedToken = req.decoded_forgot_password_token as TokenPayload
  const accountId = decodedToken.accountId

  if (password !== confirm_password) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
    })
    return
  }
  const result = await accountService.resetPassword(accountId, password, forgot_password_token)
  res.status(HTTP_STATUS.OK).json({
    result
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateReqMeBody>,
  res: Response
): Promise<void> => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { body } = req
  const result = await accountService.updateMe(accountId, body)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  const { old_password, new_password } = req.body
  const { accountId } = req.decode_authorization as TokenPayload
  const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  const isMatch = user.password === hashPassword(old_password)
  if (!isMatch) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: USER_MESSAGES.OLD_PASSWORD_IS_INCORRECT
    })
    return
  }
  const result = await accountService.changePassword(accountId, new_password)
  res.status(HTTP_STATUS.OK).json({
    result
  })
}

export const registerSellerController = async (req: Request, res: Response): Promise<void> => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await accountService.registerSeller(accountId)
  notifySellerRegistered(accountId)
  res.status(HTTP_STATUS.OK).json({
    result
  })
}
