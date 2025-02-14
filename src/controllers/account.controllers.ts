import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'
import {
  EmailVerifyReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/requests/Account.requests'
import Accounts from '~/models/schemas/Account.schema'
import accountService from '~/services/accounts.services'
import databaseServices from '~/services/database.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userName, email, password, phoneNumber } = req.body
  const result = await accountService.register({ userName, email, password, phoneNumber })
  res.status(HTTP_STATUS.CREATED).json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const account = req.account as Accounts
  const accountId = account._id as ObjectId
  const result = await accountService.login(accountId.toString())
  res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await accountService.logout(refresh_token)
  res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { userId } = req.decode_authorization as TokenPayload
  const result = await accountService.refreshToken(userId, refresh_token)
  res.json({
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
    res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await accountService.verifyEmail(accountId)
  res.json({
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
    res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await accountService.resendVerifyEmail(accountId)
  res.json({
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
