import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/Account.requests'
import orderService from '~/services/order.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateOrderReqBody } from '~/models/requests/Order.requests'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderType } from '~/constants/enums'

//Buyer
export const getAccountOrdersController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await orderService.getOrdersByAccountId(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const createOrderController = async (req: Request<ParamsDictionary, any, CreateOrderReqBody>, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = req.body
  let result

  if (payload.orderType === OrderType.Direct) {
    result = await orderService.createDirectOrder(accountId, payload)
  } else if (payload.orderType === OrderType.Cart) {
    result = await orderService.createCartOrder(accountId, payload)
  }
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const cancelOrderController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { orderId } = req.params
  const { reason } = req.body

  const result = await orderService.cancelOrder(accountId, orderId, reason)

  res.status(HTTP_STATUS.OK).json(result)
}

export const completeOrderController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { orderId } = req.params

  const result = await orderService.completeOrder(accountId, orderId)

  res.status(HTTP_STATUS.OK).json(result)
}

//Seller
export const getSellerOrdersController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await orderService.getSellerOrders(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const confirmOrderController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { orderId } = req.params

  const result = await orderService.confirmOrder(accountId, orderId)

  res.status(HTTP_STATUS.OK).json(result)
}

export const processOrderController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { orderId } = req.params

  const result = await orderService.processOrder(accountId, orderId)

  res.status(HTTP_STATUS.OK).json(result)
}

export const sellerCancelOrderController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { orderId } = req.params
  const { reason } = req.body

  const result = await orderService.sellerCancelOrder(accountId, orderId, reason)

  res.status(HTTP_STATUS.OK).json(result)
}
