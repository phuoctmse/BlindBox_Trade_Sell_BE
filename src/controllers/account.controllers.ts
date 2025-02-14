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
  TokenPayload,
  ForgotPasswordReqBody
} from '~/models/requests/Account.requests'
import Accounts from '~/models/schemas/Account.schema'
import accountService from '~/services/accounts.services'
import databaseServices from '~/services/database.services'
import jwt from 'jsonwebtoken'

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

export const forgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await databaseServices.accounts.findOne({ email });

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.EMAIL_NOT_FOUND,
    });
    return;
  }


  const expiresIn = process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN;
  // Generate JWT
  const forgotPasswordToken = jwt.sign(
    { accountId: user._id.toString() },
    process.env.JWT_FORGOT_PASSWORD_TOKEN as string,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );


  // Save token
  await databaseServices.accounts.updateOne(
    { _id: user._id },
    { $set: { forgot_password_token: forgotPasswordToken } }
  );
  res.json({ message: USER_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT });
};


export const verifyForgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { forgot_password_token } = req.body;

    const decodedToken = jwt.verify(
      forgot_password_token,
      process.env.JWT_FORGOT_PASSWORD_TOKEN as string
    ) as TokenPayload;

    const accountId = decodedToken.accountId;

    const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) });

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USER_MESSAGES.USER_NOT_FOUND,
      });
      return;
    }

    // Check if token is already used
    if (!user.forgot_password_token || user.forgot_password_token !== forgot_password_token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
      });
      return;
    }

    //Clear token
    await databaseServices.accounts.updateOne(
      { _id: user._id },
      { $set: { forgot_password_token: '' } }
    );

    res.json({ message: USER_MESSAGES.VALID_FORGOT_PASSWORD_TOKEN });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
        error: error.message,
      });
    } else {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: 'An unknown error occurred',
      });
    }
  }
}

