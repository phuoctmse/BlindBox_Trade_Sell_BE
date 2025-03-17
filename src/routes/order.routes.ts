import { Router } from 'express'
import {
  cancelOrderController,
  completeOrderController,
  confirmOrderController,
  createOrderController,
  getAccountOrdersController,
  getSellerOrdersController,
  processOrderController,
  sellerCancelOrderController
} from '~/controllers/order.controllers'
import { accessTokenValidation, validateRegisterSelling } from '~/middlewares/accounts.middlewares'
import {
  createOrderValidation,
  validateCancelOrder,
  validateChangeOrderStatus,
  validateCompleteOrder,
  validateReceiverInfo,
  validateSellerNotBuyingOwnProducts
} from '~/middlewares/order.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const orderRouter = Router()

//Buyer
orderRouter.get('/', accessTokenValidation, wrapRequestHandler(getAccountOrdersController))
orderRouter.post(
  '/',
  accessTokenValidation,
  validateReceiverInfo,
  validateSellerNotBuyingOwnProducts,
  createOrderValidation,
  wrapRequestHandler(createOrderController)
)
orderRouter.patch(
  '/:orderId/cancel',
  accessTokenValidation,
  validateCancelOrder,
  wrapRequestHandler(cancelOrderController)
)
orderRouter.patch(
  '/:orderId/complete',
  accessTokenValidation,
  validateCompleteOrder,
  wrapRequestHandler(completeOrderController)
)

//Seller
orderRouter.get(
  '/seller',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(getSellerOrdersController)
)
orderRouter.patch(
  '/seller/:orderId/confirm',
  accessTokenValidation,
  validateRegisterSelling,
  validateChangeOrderStatus,
  wrapRequestHandler(confirmOrderController)
)
orderRouter.patch(
  '/seller/:orderId/process',
  accessTokenValidation,
  validateRegisterSelling,
  validateChangeOrderStatus,
  wrapRequestHandler(processOrderController)
)
orderRouter.patch(
  '/seller/:orderId/cancel',
  accessTokenValidation,
  validateRegisterSelling,
  validateCancelOrder,
  wrapRequestHandler(sellerCancelOrderController)
)

export default orderRouter
