import { Router } from 'express'
import { createProductController, getAllProductsController } from '~/controllers/product.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createBlindBoxesValidation } from '~/middlewares/products.middleware'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

// productsRouter.get('/blind-boxes', accessTokenValidation, wrapRequestHandler(getAllProductsController))
productsRouter.post(
  '/blind-boxes',
  accessTokenValidation,
  createBlindBoxesValidation,
  filterMiddleware<CreateBlindBoxesReqBody>(['brand', 'description', 'name', 'price', 'quantity', 'size']),
  wrapRequestHandler(createProductController)
)
// productsRouter.get('/:id', accessTokenValidation, wrapRequestHandler(getProductController))
// productsRouter.put('/:id', accessTokenValidation, wrapRequestHandler(updateProductController))
// productsRouter.delete('/:id', accessTokenValidation, wrapRequestHandler(deleteProductController))

export default productsRouter
