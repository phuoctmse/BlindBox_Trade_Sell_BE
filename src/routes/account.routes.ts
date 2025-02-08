import { Router } from 'express'
import { loginController, registerController } from '~/controllers/account.controllers'
import { loginValidation, registerValidation } from '~/middlewares/accounts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()


accountsRouter.post('/login', loginValidation, wrapRequestHandler(loginController))

// /**
//  * Path: /register
//  * Method: POST
//  * Description: Register a new user
//  * Body: { name: string, email: string, password: string, confirm_password: string,
//  * date_of_birth: ISO8601 }
//  */
accountsRouter.post('/register', registerValidation, wrapRequestHandler(registerController))

// /**
//  * Path: /Logout
//  * Method: POST
//  * Description: Logout a user
//  * Headers: { Authorization: Bearer <access_token> }
//  * Body: { refresh_token: string }
//  */
// accountsRouter.post('/logout', accessTokenValidation, refreshTokenValidation, wrapRequestHandler(logoutController))

// /**
//  * Path: /refresh-token
//  * Method: POST
//  * Description: Refresh a user's access token
//  * Body: { refresh_token: string }
//  */
// accountsRouter.post('/refresh-token', refreshTokenValidation, wrapRequestHandler(refreshTokenController))

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
