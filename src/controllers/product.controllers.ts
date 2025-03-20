import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { LogoutReqBody, TokenPayload } from '~/models/requests/Account.requests'
import {
  CreateAccessoriesReqBody,
  CreateBeadsReqBody,
  CreateBlindBoxesReqBody,
  CreateOpenedItem,
  CreatePromotions
} from '~/models/requests/Product.request'
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
  const allBlindBoxes = await productService.getAllBlindBoxes()
  const approvedBlindBoxes = allBlindBoxes.result.filter((box: any) => box.status === 1)
  res.status(HTTP_STATUS.OK).json(approvedBlindBoxes)
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

export const createAccessoriesController = async (
  req: Request<ParamsDictionary, any, CreateAccessoriesReqBody>,
  res: Response
): Promise<void> => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = { ...req.body } as CreateAccessoriesReqBody
  const accessories = await productService.createAccessories(payload, accountId)
  res.status(HTTP_STATUS.CREATED).json(accessories)
}

export const getAllBeadsController = async (req: Request, res: Response) => {
  const result = await productService.getAllBeads()
  res.status(HTTP_STATUS.OK).json(result)
}

export const getBeadsDetailsController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await productService.getBeadsDetails(id as string)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getAccessoryDetailController = async (req: Request, res: Response) => {
  const { slug } = req.params
  const { id } = req.query
  if (id === undefined) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: PRODUCT_MESSAGES.PRODUCT_ID_REQUIRED
    })
  }
  const result = await productService.getAccessoryDetail(slug, id as string)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getAllOpenedItemsController = async (req: Request, res: Response) => {
  const result = await productService.getAllOpenedItems()
  res.status(HTTP_STATUS.OK).json(result)
}

export const createOpenedItemController = async (
  req: Request<ParamsDictionary, any, CreateOpenedItem>,
  res: Response
) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = { ...req.body }
  const result = await productService.createOpenedItem(payload, accountId)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const getPromotionsBySellerIdController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const sellerId = accountId
  const result = await productService.getPromotionBySellerId(sellerId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getAllPromotionsController = async (req: Request, res: Response) => {
  const result = await productService.getAllPromotions()
  res.status(HTTP_STATUS.OK).json(result)
}

export const createPromotionController = async (req: Request<ParamsDictionary, any, CreatePromotions>, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = { ...req.body }
  const result = await productService.createPromotion(payload, accountId)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const editPromotionController = async (req: Request<ParamsDictionary, any, CreatePromotions>, res: Response) => {
  const { promotionId } = req.params
  const payload = { ...req.body }
  const result = await productService.editPromotion(payload, promotionId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const deletePromotionController = async (req: Request, res: Response) => {
  const { promotionId } = req.params
  const result = await productService.deletePromotion(promotionId)
  res.status(HTTP_STATUS.OK).json(result)
}