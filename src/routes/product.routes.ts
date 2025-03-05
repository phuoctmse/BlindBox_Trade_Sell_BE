import { Router } from 'express'
import {
  createBlindBoxesController,
  getALlBlindBoxesController,
  getBlindBoxesDetailsController,
  getMyBlindBoxesController
} from '~/controllers/product.controllers'
import { accessTokenValidation, validateRegisterSelling } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createBlindBoxesValidation } from '~/middlewares/products.middleware'
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
  filterMiddleware<CreateBlindBoxesReqBody>(['brand', 'description', 'name', 'price', 'quantity', 'size']),
  wrapRequestHandler(createBlindBoxesController)
)
// productsRouter.put('/:id', accessTokenValidation, wrapRequestHandler(updateProductController))
// productsRouter.delete('/:id', accessTokenValidation, wrapRequestHandler(deleteProductController))

//Buyer
productsRouter.get('/blind-boxes', wrapRequestHandler(getALlBlindBoxesController))
productsRouter.get('/blind-boxes/:slug', accessTokenValidation, wrapRequestHandler(getBlindBoxesDetailsController))

export default productsRouter
