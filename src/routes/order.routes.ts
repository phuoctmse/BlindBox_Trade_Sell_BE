import { Router } from 'express'
import orderController from '~/controllers/order.controllers'
import { accessTokenValidation, validateRegisterSelling } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createOrderValidation,
  validateCancelOrder,
  validateChangeOrderStatus,
  validateCompleteOrder,
  validateReceiverInfo,
  validateSellerNotBuyingOwnProducts
} from '~/middlewares/order.middlewares'
import { CreateOrderReqBody } from '~/models/requests/Order.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const orderRouter = Router()

// Buyer routes
orderRouter.get('/', accessTokenValidation, wrapRequestHandler(orderController.getAccountOrders))
orderRouter.post(
  '/',
  accessTokenValidation,
  validateReceiverInfo,
  validateSellerNotBuyingOwnProducts,
  createOrderValidation,
  wrapRequestHandler(orderController.createOrder)
)
orderRouter.patch(
  '/:orderId/cancel',
  accessTokenValidation,
  validateCancelOrder,
  wrapRequestHandler(orderController.cancelOrder)
)
orderRouter.patch(
  '/:orderId/complete',
  accessTokenValidation,
  validateCompleteOrder,
  wrapRequestHandler(orderController.completeOrder)
)

orderRouter.get('/promotions', accessTokenValidation, wrapRequestHandler(orderController.getUserPromotions))

// Seller routes
orderRouter.get(
  '/seller',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(orderController.getSellerOrders)
)
orderRouter.patch(
  '/seller/:orderId/confirm',
  accessTokenValidation,
  validateRegisterSelling,
  validateChangeOrderStatus,
  wrapRequestHandler(orderController.confirmOrder)
)
orderRouter.patch(
  '/seller/:orderId/process',
  accessTokenValidation,
  validateRegisterSelling,
  validateChangeOrderStatus,
  wrapRequestHandler(orderController.processOrder)
)
orderRouter.patch(
  '/seller/:orderId/cancel',
  accessTokenValidation,
  validateRegisterSelling,
  validateCancelOrder,
  wrapRequestHandler(orderController.sellerCancelOrder)
)
orderRouter.patch(
  '/seller/:orderId/complete',
  accessTokenValidation,
  validateRegisterSelling,
  validateCancelOrder,
  wrapRequestHandler(orderController.sellerCompleteOrder)
)

export default orderRouter
