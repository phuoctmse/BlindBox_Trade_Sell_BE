import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { LogoutReqBody, TokenPayload } from '~/models/requests/Account.requests'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import productService from '~/services/product.services'

export const getMyBlindBoxesController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await productService.getMyBlindBoxes(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const createBlindBoxesController = async (
  req: Request<ParamsDictionary, any, CreateBlindBoxesReqBody>,
  res: Response
) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = { ...req.body } as CreateBlindBoxesReqBody
  const result = await productService.createBlindBoxes(payload, accountId)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const getBlindBoxesDetailsController = async (req: Request, res: Response) => {
  const { slug } = req.params
  const { id } = req.query
  if (id === undefined) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: PRODUCT_MESSAGES.PRODUCT_ID_REQUIRED
    })
  }
  const result = await productService.getBlindBoxesDetails(slug, id as string)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getALlBlindBoxesController = async (req: Request, res: Response) => {
  const result = await productService.getAllBlindBoxes()
  res.status(HTTP_STATUS.OK).json(result)
}
