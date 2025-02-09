import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'
import {
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/requests/Account.requests'
import Accounts from '~/models/schemas/Account.schema'
import accountService from '~/services/accounts.services'

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
