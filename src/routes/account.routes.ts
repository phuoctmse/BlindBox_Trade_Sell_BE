import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/account.controllers'
import {
  accessTokenValidation,
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

// /**
//  * Path: /verify-email
//  * Method: POST
//  * Description: Verify a user's email
//  * Body: { refresh_token: string }
//  */
// accountsRouter.post('/verify-email', emailVerifyTokenValidation, wrapRequestHandler(emailVerifyController))

// /**
//  * Path: /resend-verify-email
//  * Method: POST
//  * Description: Resend verify a user's email
//  * Headers: { Authorization: Bearer <access_token> }
//  */
// accountsRouter.post('/resend-verify-email', accessTokenValidation, wrapRequestHandler(resendEmailVerifyController))

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
