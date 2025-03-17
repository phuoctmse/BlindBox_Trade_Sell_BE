import { Router } from 'express'
import {
  addToCartController,
  clearAllCartItemController,
  deleteCartItemController,
  getCartController,
  updateCartController
} from '~/controllers/cart.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { addToCartValidation, updateCartValidation } from '~/middlewares/carts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const cartRouter = Router()

cartRouter.get('/', accessTokenValidation, getCartController)
cartRouter.post('/', accessTokenValidation, addToCartValidation, wrapRequestHandler(addToCartController))
cartRouter.put('/:itemId', accessTokenValidation, updateCartValidation, wrapRequestHandler(updateCartController))
cartRouter.delete('/:id', accessTokenValidation, wrapRequestHandler(deleteCartItemController))
cartRouter.post('/clear-all', accessTokenValidation, wrapRequestHandler(clearAllCartItemController))

export default cartRouter
