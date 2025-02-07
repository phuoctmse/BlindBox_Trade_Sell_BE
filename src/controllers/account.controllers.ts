import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'
import { RegisterReqBody } from '~/models/requests/Account.requests'
import accountService from '~/services/accounts.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userName, email, password, phoneNumber } = req.body
  const result = await accountService.register({ userName, email, password, phoneNumber })
  res.status(HTTP_STATUS.CREATED).json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
