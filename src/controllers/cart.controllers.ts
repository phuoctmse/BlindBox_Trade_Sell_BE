import { Request, Response } from 'express'
import { AddToCartReqBody, UpdateCartItemReqBody } from '~/models/requests/cart.requests'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/Account.requests'
import cartService from '~/services/cart.services'
import HTTP_STATUS from '~/constants/httpStatus'

export const getCartController = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await cartService.getCart(accountId)

  res.status(HTTP_STATUS.OK).json(result)
}

export const addToCartController = async (req: Request<ParamsDictionary, any, AddToCartReqBody>, res: Response) => {
  const payload = req.body
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await cartService.addToCart(accountId, payload)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const updateCartController = async (
  req: Request<ParamsDictionary, any, UpdateCartItemReqBody>,
  res: Response
) => {
  const payload = req.body
  const { itemId } = req.params
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await cartService.updateCart(accountId, itemId, payload)
  res.status(HTTP_STATUS.OK).json(result)
}

export const deleteCartItemController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const result = await cartService.deleteCartItem(accountId, id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const clearAllCartItemController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await cartService.clearAllCartItem(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}
