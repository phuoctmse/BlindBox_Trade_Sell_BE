import { Router } from 'express'
import { addToCartController, deleteCartItemController, getCartController, updateCartController } from '~/controllers/cart.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { addToCartValidation } from '~/middlewares/carts.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const cartRouter = Router()

cartRouter.get('/', accessTokenValidation, getCartController)
cartRouter.post('/', accessTokenValidation, addToCartValidation, wrapRequestHandler(addToCartController))
cartRouter.put('/:itemId', accessTokenValidation, wrapRequestHandler(updateCartController))
cartRouter.delete('/:id', accessTokenValidation, wrapRequestHandler(deleteCartItemController))

export default cartRouter
