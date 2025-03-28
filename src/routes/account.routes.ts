import { Router } from 'express'
import accountController from '~/controllers/account.controllers'
import {
  accessTokenValidation,
  emailVerifyTokenValidation,
  forgotPasswordTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  verifyForgotPasswordTokenValidation,
  resetPasswordValidation,
  verifiedUserValidation,
  updateMeValidation,
  changePasswordValidation
} from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateReqMeBody } from '~/models/requests/Account.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

accountsRouter.post('/login', loginValidation, wrapRequestHandler(accountController.login))

accountsRouter.get('/oauth/google', wrapRequestHandler(accountController.oauth))

accountsRouter.post('/register', registerValidation, wrapRequestHandler(accountController.register))

accountsRouter.post(
  '/logout',
  accessTokenValidation,
  refreshTokenValidation,
  wrapRequestHandler(accountController.logout)
)

accountsRouter.post('/refresh-token', refreshTokenValidation, wrapRequestHandler(accountController.refreshToken))

accountsRouter.post('/verify-email', emailVerifyTokenValidation, wrapRequestHandler(accountController.emailVerify))

accountsRouter.post(
  '/resend-verify-email',
  accessTokenValidation,
  wrapRequestHandler(accountController.resendEmailVerify)
)

accountsRouter.post(
  '/forgot-password',
  forgotPasswordTokenValidation,
  wrapRequestHandler(accountController.forgotPassword)
)

accountsRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidation,
  wrapRequestHandler(accountController.verifyForgotPassword)
)

accountsRouter.post('/reset-password', resetPasswordValidation, wrapRequestHandler(accountController.resetPassword))

accountsRouter.get('/me', accessTokenValidation, wrapRequestHandler(accountController.getMe))

accountsRouter.patch(
  '/me',
  accessTokenValidation,
  updateMeValidation,
  filterMiddleware<UpdateReqMeBody>(['email', 'address', 'fullName', 'phoneNumber']),
  wrapRequestHandler(accountController.updateMe)
)

accountsRouter.put(
  '/change-password',
  accessTokenValidation,
  verifiedUserValidation,
  changePasswordValidation,
  wrapRequestHandler(accountController.changePassword)
)

accountsRouter.patch('/register-seller', accessTokenValidation, wrapRequestHandler(accountController.registerSeller))

export default accountsRouter
