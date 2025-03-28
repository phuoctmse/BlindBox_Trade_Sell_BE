import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ProductStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import {
  CreateAccessoriesReqBody,
  CreateBlindBoxesReqBody,
  CreateOpenedItem,
  CreatePromotions
} from '~/models/requests/Product.request'
import Products from '~/models/schemas/Product.schema'
import productService from '~/services/product.services'

class ProductController {
  // Seller Blind Box methods
  async getMyBlindBoxes(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await productService.getMyBlindBoxes(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createBlindBoxes(req: Request<ParamsDictionary, any, CreateBlindBoxesReqBody>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const payload = { ...req.body } as CreateBlindBoxesReqBody
    const result = await productService.createBlindBoxes(payload, accountId)
    res.status(HTTP_STATUS.CREATED).json(result)
  }

  async updateProduct(req: Request<ParamsDictionary, any, CreateBlindBoxesReqBody>, res: Response) {
    const { id } = req.params
    const payload = { ...req.body }
    const result = await productService.updateProduct(id, payload)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deleteProduct(req: Request, res: Response) {
    const { id } = req.params
    const result = await productService.deleteProduct(id)
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: result.message })
      return
    }
    res.status(HTTP_STATUS.OK).json(result)
  }

  // Buyer Blind Box methods
  async getAllApprovedBlindBoxes(req: Request, res: Response) {
    const allBlindBoxes = await productService.getAllBlindBoxes()
    const approvedBlindBoxes = allBlindBoxes.result.filter(
      (box: { _id: string; status: ProductStatus }) => box.status === ProductStatus.Active
    )
    res.status(HTTP_STATUS.OK).json(approvedBlindBoxes)
  }

  async getBlindBoxesDetails(req: Request, res: Response) {
    const { slug } = req.params
    const { id } = req.query
    if (id === undefined) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PRODUCT_MESSAGES.PRODUCT_ID_REQUIRED
      })
      return
    }
    const result = await productService.getBlindBoxesDetails(slug, id as string)
    res.status(HTTP_STATUS.OK).json(result)
  }

  // Accessories/Customization methods
  async getAllBeads(req: Request, res: Response) {
    const result = await productService.getAllBeads()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getBeadsDetails(req: Request, res: Response) {
    const { id } = req.params
    const result = await productService.getBeadsDetails(id as string)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createAccessories(req: Request<ParamsDictionary, any, CreateAccessoriesReqBody>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const payload = { ...req.body } as CreateAccessoriesReqBody
    const accessories = await productService.createAccessories(payload, accountId)
    res.status(HTTP_STATUS.CREATED).json(accessories)
  }

  async getAccessoryDetail(req: Request, res: Response) {
    const { slug } = req.params
    const { id } = req.query
    if (id === undefined) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: PRODUCT_MESSAGES.PRODUCT_ID_REQUIRED
      })
      return
    }
    const result = await productService.getAccessoryDetail(slug, id as string)
    res.status(HTTP_STATUS.OK).json(result)
  }

  // Opened Items methods
  async getAllOpenedItems(req: Request, res: Response) {
    const result = await productService.getAllOpenedItems()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createOpenedItem(req: Request<ParamsDictionary, any, CreateOpenedItem>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const payload = { ...req.body }
    const result = await productService.createOpenedItem(payload, accountId)
    res.status(HTTP_STATUS.CREATED).json(result)
  }

  // Promotions methods
  async getPromotionsBySellerId(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const sellerId = accountId
    const result = await productService.getPromotionBySellerId(sellerId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getAllPromotions(req: Request, res: Response) {
    const result = await productService.getAllPromotions()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createPromotion(req: Request<ParamsDictionary, any, CreatePromotions>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const payload = { ...req.body }
    const result = await productService.createPromotion(payload, accountId)
    res.status(HTTP_STATUS.CREATED).json(result)
  }

  async editPromotion(req: Request<ParamsDictionary, any, CreatePromotions>, res: Response) {
    const { promotionId } = req.params
    const payload = { ...req.body }
    const result = await productService.editPromotion(payload, promotionId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deletePromotion(req: Request, res: Response) {
    const { promotionId } = req.params
    const result = await productService.deletePromotion(promotionId)
    res.status(HTTP_STATUS.OK).json(result)
  }
}

const productController = new ProductController()

export default productController
