import { create } from 'axios'
import { Router } from 'express'
import { cancelOrderController, createOrderController, getAccountOrdersController } from '~/controllers/order.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { createOrderValidation, validateCancelOrder, validateReceiverInfo } from '~/middlewares/order.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const orderRouter = Router()

//Buyer
orderRouter.get('/', accessTokenValidation, wrapRequestHandler(getAccountOrdersController))
orderRouter.post(
  '/',
  accessTokenValidation,
  validateReceiverInfo,
  createOrderValidation,
  wrapRequestHandler(createOrderController)
)

orderRouter.patch(
  '/:orderId/cancel',
  accessTokenValidation,
  validateCancelOrder,
  wrapRequestHandler(cancelOrderController)
)

export default orderRouter
