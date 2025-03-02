import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { LogoutReqBody, TokenPayload } from '~/models/requests/Account.requests'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import productService from '~/services/product.services'

export const getAllProductsController = async (req: Request, res: Response) => {
  res.json({
    message: 'Get all products'
  })
}

export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateBlindBoxesReqBody>,
  res: Response
) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = { ...req.body } as CreateBlindBoxesReqBody
  const result = await productService.createBlindBoxes(payload, accountId)
  res.status(HTTP_STATUS.CREATED).json(result)
}
