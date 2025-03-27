import { Router } from 'express'
import paymentController from '~/controllers/payment.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const paymentRouter = Router()

paymentRouter.post('/webhook', wrapRequestHandler(paymentController.getWebHook))

paymentRouter.get(
  '/order/:orderId',
  accessTokenValidation,
  wrapRequestHandler(paymentController.createOrderPaymentLink)
)

paymentRouter.post('/topup', accessTokenValidation, wrapRequestHandler(paymentController.createCreditTopupLink))

export default paymentRouter
