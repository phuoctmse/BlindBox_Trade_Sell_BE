import { Router } from 'express'
import productController from '~/controllers/product.controllers'
import { accessTokenValidation, validateRegisterSelling } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createBlindBoxesValidation,
  validateCreateCustomization,
  validationOpenedItem
} from '~/middlewares/products.middleware'
import { CreateBlindBoxesReqBody, CreateOpenedItem } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

//Seller
productsRouter.get(
  '/seller/blind-boxes',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(productController.getMyBlindBoxes)
)
productsRouter.post(
  '/seller/blind-boxes',
  accessTokenValidation,
  validateRegisterSelling,
  createBlindBoxesValidation,
  filterMiddleware<CreateBlindBoxesReqBody>(['image', 'brand', 'description', 'name', 'price', 'quantity', 'size']),
  wrapRequestHandler(productController.createBlindBoxes)
)
productsRouter.put(
  '/seller/blind-boxes/:id',
  accessTokenValidation,
  filterMiddleware<CreateBlindBoxesReqBody>(['brand', 'description', 'name', 'price', 'quantity', 'size']),
  wrapRequestHandler(productController.updateProduct)
)
productsRouter.delete(
  '/seller/blind-boxes/:id',
  accessTokenValidation,
  wrapRequestHandler(productController.deleteProduct)
)

//Buyer
productsRouter.get('/blind-boxes', wrapRequestHandler(productController.getAllApprovedBlindBoxes))
productsRouter.get(
  '/blind-boxes/:slug',
  accessTokenValidation,
  wrapRequestHandler(productController.getBlindBoxesDetails)
)

//Customize
productsRouter.get(
  '/accessories/customization',
  accessTokenValidation,
  wrapRequestHandler(productController.getAllBeads)
)
productsRouter.post(
  '/accessories/customization',
  accessTokenValidation,
  validateCreateCustomization,
  wrapRequestHandler(productController.createAccessories)
)
productsRouter.get(
  '/accessories/:slug',
  accessTokenValidation,
  wrapRequestHandler(productController.getAccessoryDetail)
)

productsRouter.get('/opened-items', accessTokenValidation, wrapRequestHandler(productController.getAllOpenedItems))

productsRouter.post(
  '/opened-items',
  accessTokenValidation,
  validationOpenedItem,
  filterMiddleware<CreateOpenedItem>(['image', 'brand', 'description', 'name', 'price', 'quantity', 'condition']),
  wrapRequestHandler(productController.createOpenedItem)
)

productsRouter.get('/promotions', accessTokenValidation, wrapRequestHandler(productController.getAllPromotions))
productsRouter.get(
  '/seller/promotions',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(productController.getPromotionsBySellerId)
)
productsRouter.post(
  '/seller/promotions',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(productController.createPromotion)
)
productsRouter.put(
  '/seller/promotions/:promotionId',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(productController.editPromotion)
)
productsRouter.delete(
  '/seller/promotions/:promotionId',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(productController.deletePromotion)
)
export default productsRouter
