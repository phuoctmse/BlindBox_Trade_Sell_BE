import { Router } from 'express'
import {
  createCreditTopupLinkController,
  createOrderPaymentLinkController,
  getWebHookController
} from '~/controllers/payment.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const paymentRouter = Router()

paymentRouter.post('/webhook', getWebHookController)

paymentRouter.get('/order/:orderId', accessTokenValidation, wrapRequestHandler(createOrderPaymentLinkController))

paymentRouter.post('/topup', accessTokenValidation, wrapRequestHandler(createCreditTopupLinkController))

export default paymentRouter
