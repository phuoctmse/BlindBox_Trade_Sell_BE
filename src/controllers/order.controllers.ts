import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/Account.requests'
import orderService from '~/services/order.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateOrderReqBody } from '~/models/requests/Order.requests'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderType } from '~/constants/enums'

class OrderController {
  // Buyer methods
  async getAccountOrders(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await orderService.getOrdersByAccountId(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createOrder(req: Request<ParamsDictionary, any, CreateOrderReqBody>, res: Response) {
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

  async cancelOrder(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { orderId } = req.params
    const { reason } = req.body

    const result = await orderService.cancelOrder(accountId, orderId, reason)

    res.status(HTTP_STATUS.OK).json(result)
  }

  async completeOrder(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { orderId } = req.params

    const result = await orderService.completeOrder(accountId, orderId)

    res.status(HTTP_STATUS.OK).json(result)
  }

  async getUserPromotions(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await orderService.getUserPromotions(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  // Seller methods
  async getSellerOrders(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await orderService.getSellerOrders(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async confirmOrder(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { orderId } = req.params

    const result = await orderService.sellerConfirmOrder(accountId, orderId)

    res.status(HTTP_STATUS.OK).json(result)
  }

  async processOrder(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { orderId } = req.params

    const result = await orderService.sellerProcessOrder(accountId, orderId)

    res.status(HTTP_STATUS.OK).json(result)
  }

  async sellerCancelOrder(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { orderId } = req.params
    const { reason } = req.body

    const result = await orderService.sellerCancelOrder(accountId, orderId, reason)

    res.status(HTTP_STATUS.OK).json(result)
  }

  async sellerCompleteOrder(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { orderId } = req.params

    const result = await orderService.sellerCompleteOrder(accountId, orderId)

    res.status(HTTP_STATUS.OK).json(result)
  }
}

export default new OrderController()
