import { Router } from 'express'
import {
  createAccessoriesController,
  createBlindBoxesController,
  deleteProductController,
  getAllApprovedBlindBoxesController,
  getBlindBoxesDetailsController,
  getMyBlindBoxesController,
  updateProductController,
  getAllBeadsController
} from '~/controllers/product.controllers'
import { accessTokenValidation, validateRegisterSelling } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createBlindBoxesValidation, validateCreateCustomization } from '~/middlewares/products.middleware'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

//Seller
productsRouter.get(
  '/seller/blind-boxes',
  accessTokenValidation,
  validateRegisterSelling,
  wrapRequestHandler(getMyBlindBoxesController)
)
productsRouter.post(
  '/seller/blind-boxes',
  accessTokenValidation,
  validateRegisterSelling,
  createBlindBoxesValidation,
  filterMiddleware<CreateBlindBoxesReqBody>(['image', 'brand', 'description', 'name', 'price', 'quantity', 'size']),
  wrapRequestHandler(createBlindBoxesController)
)
productsRouter.put(
  '/seller/blind-boxes/:id',
  accessTokenValidation,
  filterMiddleware<CreateBlindBoxesReqBody>(['brand', 'description', 'name', 'price', 'quantity', 'size']),
  wrapRequestHandler(updateProductController)
)
productsRouter.delete('/seller/blind-boxes/:id', accessTokenValidation, wrapRequestHandler(deleteProductController))

//Buyer
productsRouter.get('/blind-boxes', wrapRequestHandler(getAllApprovedBlindBoxesController))
productsRouter.get('/blind-boxes/:slug', accessTokenValidation, wrapRequestHandler(getBlindBoxesDetailsController))

//Customize
productsRouter.get('/accessories/customization', accessTokenValidation, wrapRequestHandler(getAllBeadsController))
productsRouter.post(
  '/accessories/customization',
  accessTokenValidation,
  validateCreateCustomization,
  wrapRequestHandler(createAccessoriesController)
)
productsRouter.get('/accessories/:slug', wrapRequestHandler(getAllApprovedBlindBoxesController))

export default productsRouter
