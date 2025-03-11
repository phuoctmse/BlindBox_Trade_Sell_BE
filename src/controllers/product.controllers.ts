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

export const getAllApprovedBlindBoxesController = async (req: Request, res: Response) => {
  const result = await productService.getAllBlindBoxes()
  const approvedBlindBoxes = result.result.filter((box: any) => box.status === 1)
  res.status(HTTP_STATUS.OK).json(approvedBlindBoxes)
}

export const getALlBlindBoxesController = async (req: Request, res: Response) => {
  const result = await productService.getAllBlindBoxes()
  res.status(HTTP_STATUS.OK).json(result)
}

export const updateProductController = async (
  req: Request<ParamsDictionary, any, CreateBlindBoxesReqBody>,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const payload = { ...req.body }
  const result = await productService.updateProduct(id, payload)
  res.status(HTTP_STATUS.OK).json(result)
}

export const deleteProductController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const result = await productService.deleteProduct(id)
  if (!result.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: result.message })
    return
  }
  res.status(HTTP_STATUS.OK).json(result)
}
