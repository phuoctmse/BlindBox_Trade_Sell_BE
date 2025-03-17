import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/Account.requests'
import orderService from '~/services/order.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateOrderReqBody } from '~/models/requests/Order.requests'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderType } from '~/constants/enums'

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

  const result = await orderService.cancelOrder(accountId, orderId)

  res.status(HTTP_STATUS.OK).json(result)
}
