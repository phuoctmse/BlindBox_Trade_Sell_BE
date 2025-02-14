import { Router } from 'express'
import {
  emailVerifyController,
  getMeController,
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordController
} from '~/controllers/account.controllers'
import {
  accessTokenValidation,
  emailVerifyTokenValidation,
  forgotPasswordTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  verifyForgotPasswordTokenValidation
} from '~/middlewares/accounts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

accountsRouter.post('/login', loginValidation, wrapRequestHandler(loginController))

accountsRouter.post('/register', registerValidation, wrapRequestHandler(registerController))

accountsRouter.post('/logout', accessTokenValidation, refreshTokenValidation, wrapRequestHandler(logoutController))

accountsRouter.post('/refresh-token', refreshTokenValidation, wrapRequestHandler(refreshTokenController))

accountsRouter.post('/verify-email', emailVerifyTokenValidation, wrapRequestHandler(emailVerifyController))

accountsRouter.post('/resend-verify-email', accessTokenValidation, wrapRequestHandler(resendEmailVerifyController))

accountsRouter.post('/forgot-password', forgotPasswordTokenValidation, wrapRequestHandler(forgotPasswordController))

accountsRouter.post('/verify-forgot-password', verifyForgotPasswordTokenValidation, wrapRequestHandler(verifyForgotPasswordController))


// /**
//  * Path: /reset-password
//  * Method: POST
//  * Description: Reset password
//  * Body: { forgot_password_token: string, password: string, confirm_password: string }
//  */
// accountsRouter.post('/reset-password', resetPasswordValidation, wrapRequestHandler(resetPasswordController))

accountsRouter.get('/me', accessTokenValidation, wrapRequestHandler(getMeController))

export default accountsRouter
