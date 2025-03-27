import { Router } from 'express'
import cartController from '~/controllers/cart.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { addToCartValidation, updateCartValidation } from '~/middlewares/carts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { AddToCartReqBody } from '~/models/requests/cart.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const cartRouter = Router()

cartRouter.get('/', accessTokenValidation, wrapRequestHandler(cartController.getCart))
cartRouter.post(
  '/',
  accessTokenValidation,
  addToCartValidation,
  filterMiddleware<AddToCartReqBody>(['productId', 'quantity']),
  wrapRequestHandler(cartController.addToCart)
)
cartRouter.put('/:itemId', accessTokenValidation, updateCartValidation, wrapRequestHandler(cartController.updateCart))
cartRouter.delete('/:id', accessTokenValidation, wrapRequestHandler(cartController.deleteCartItem))
cartRouter.post('/clear-all', accessTokenValidation, wrapRequestHandler(cartController.clearAllCartItem))

export default cartRouter
