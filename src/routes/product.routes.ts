import { Router } from 'express'
import { getAllProductsController } from '~/controllers/product.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

productsRouter.get('/all', accessTokenValidation, wrapRequestHandler(getAllProductsController))

export default productsRouter
