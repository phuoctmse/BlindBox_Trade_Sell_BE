import { Router } from 'express'
import {
  emailVerifyController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController
} from '~/controllers/account.controllers'
import {
  accessTokenValidation,
  emailVerifyTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation
} from '~/middlewares/accounts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

accountsRouter.post('/login', loginValidation, wrapRequestHandler(loginController))

accountsRouter.post('/register', registerValidation, wrapRequestHandler(registerController))

accountsRouter.post('/logout', accessTokenValidation, refreshTokenValidation, wrapRequestHandler(logoutController))

accountsRouter.post('/refresh-token', refreshTokenValidation, wrapRequestHandler(refreshTokenController))

accountsRouter.post('/verify-email', emailVerifyTokenValidation, wrapRequestHandler(emailVerifyController))

accountsRouter.post('/resend-verify-email', accessTokenValidation, wrapRequestHandler(resendEmailVerifyController))

// /**
//  * Path: /forgot-password
//  * Method: POST
//  * Description: Forgot password
//  * Body: { email: string }
//  */
// accountsRouter.post('/forgot-password', forgotPasswordTokenValidation, wrapRequestHandler(forgotPasswordController))

// /**
//  * Path: /verify-forgot-password
//  * Method: POST
//  * Description: Verify link forgot password
//  * Body: { forgot_password_token: string }
//  */
// accountsRouter.post(
//   '/verify-forgot-password',
//   verifyForgotPasswordTokenValidation,
//   wrapRequestHandler(verifyForgotPasswordController)
// )

// /**
//  * Path: /reset-password
//  * Method: POST
//  * Description: Reset password
//  * Body: { forgot_password_token: string, password: string, confirm_password: string }
//  */
// accountsRouter.post('/reset-password', resetPasswordValidation, wrapRequestHandler(resetPasswordController))

// /**
//  * Path: /my-profile
//  * Method: GET
//  * Description: Get my profile
//  * Headers: { Authorization: Bearer <access_token> }
//  */
// accountsRouter.get('/my-profile', accessTokenValidation, wrapRequestHandler(getMyProfileController))

export default accountsRouter
