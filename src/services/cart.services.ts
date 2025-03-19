import { AddToCartReqBody, UpdateCartItemReqBody } from '~/models/requests/cart.requests'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES } from '~/constants/messages'
import Cart from '~/models/schemas/Cart.schema'
import CartItem from '~/models/schemas/CartItem.schema'

class CartService {
  private async findOrCreateCart(accountId: string) {
    let cart = await databaseServices.carts.findOne({
      accountId: new ObjectId(accountId)
    })

    if (!cart) {
      const newCart = new Cart({
        _id: new ObjectId(),
        accountId: new ObjectId(accountId)
      })

      await databaseServices.carts.insertOne(newCart)
      cart = newCart
    }

    return cart
  }

  private async getProductById(productId: string) {
    const product = await databaseServices.products.findOne({
      _id: new ObjectId(productId)
    })

    if (!product) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CART_MESSAGES.PRODUCT_NOT_FOUND
      })
    }

    return product
  }

  private validateProductQuantity(productQuantity: number, requestedQuantity: number) {
    if (productQuantity < requestedQuantity) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CART_MESSAGES.INSUFFICIENT_STOCK
      })
    }
  }

  private async updateCartTimestamp(cartId: ObjectId) {
    await databaseServices.carts.updateOne({ _id: cartId }, { $set: { updatedAt: new Date() } })
  }

  private async getCartItemsWithDetails(cartId: ObjectId) {
    const cartItems = await databaseServices.cartItems.find({ cartId }).toArray()
    const cartItemsWithProductDetails = []

    for (const item of cartItems) {
      const product = await databaseServices.products.findOne({
        _id: item.productId
      })

      if (product) {
        cartItemsWithProductDetails.push({
          _id: item._id,
          cartQuantity: item.quantity,
          totalPrice: item.quantity * Number(product.price),
          product
        })
      }
    }

    return {
      items: cartItemsWithProductDetails,
      totalItems: cartItems.length
    }
  }

  async getCart(accountId: string) {
    const cart = await this.findOrCreateCart(accountId)

    const { items, totalItems } = await this.getCartItemsWithDetails(cart._id)

    return {
      message: CART_MESSAGES.CART_FETCHED,
      result: {
        _id: cart._id,
        items,
        totalItems,
        createdAt: cart.createdAt
      }
    }
  }

  async addToCart(accountId: string, payload: AddToCartReqBody) {
    const { productId, quantity } = payload
    const product = await this.getProductById(productId)
    this.validateProductQuantity(product.quantity, quantity)
    const cart = await this.findOrCreateCart(accountId)
    const existingCartItem = await databaseServices.cartItems.findOne({
      cartId: cart._id,
      productId: new ObjectId(productId)
    })

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity
      this.validateProductQuantity(product.quantity, newQuantity)
      await databaseServices.cartItems.updateOne({ _id: existingCartItem._id }, { $set: { quantity: newQuantity } })
    } else {
      const newCartItem = new CartItem({
        _id: new ObjectId(),
        cartId: cart._id,
        productId: new ObjectId(productId),
        quantity: quantity,
        createdAt: new Date()
      })

      await databaseServices.cartItems.insertOne(newCartItem)
    }

    await this.updateCartTimestamp(cart._id)

    const updatedCart = await this.getCart(accountId)

    return {
      message: CART_MESSAGES.CART_ITEM_ADDED,
      result: updatedCart.result
    }
  }

  async updateCart(accountId: string, itemId: string, payload: UpdateCartItemReqBody) {
    const { quantity } = payload

    if (!ObjectId.isValid(itemId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CART_MESSAGES.CART_ITEM_NOT_FOUND
      })
    }

    const cart = await this.findOrCreateCart(accountId)

    const cartItem = await databaseServices.cartItems.findOne({
      productId: new ObjectId(itemId),
      cartId: cart._id
    })

    if (!cartItem) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CART_MESSAGES.CART_ITEM_NOT_FOUND
      })
    }

    const product = await this.getProductById(cartItem.productId.toString())

    this.validateProductQuantity(product.quantity, quantity)
    await databaseServices.cartItems.updateOne({ _id: cartItem._id }, { $set: { quantity } })

    await this.updateCartTimestamp(cart._id)

    const updatedCart = await this.getCart(accountId)

    return {
      message: CART_MESSAGES.CART_ITEM_UPDATED,
      result: updatedCart.result
    }
  }

  async deleteCartItem(accountId: string, itemId: string) {
    if (!ObjectId.isValid(itemId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CART_MESSAGES.CART_ITEM_NOT_FOUND
      })
    }

    const cart = await this.findOrCreateCart(accountId)

    const cartItem = await databaseServices.cartItems.findOne({
      productId: new ObjectId(itemId),
      cartId: cart._id
    })

    if (!cartItem) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CART_MESSAGES.CART_ITEM_NOT_FOUND
      })
    }

    await databaseServices.cartItems.deleteOne({ _id: cartItem._id })

    await this.updateCartTimestamp(cart._id)

    const updatedCart = await this.getCart(accountId)

    return {
      message: CART_MESSAGES.CART_ITEM_DELETED,
      result: updatedCart.result
    }
  }

  async clearAllCartItem(accountId: string) {
    const cart = await this.findOrCreateCart(accountId)

    await databaseServices.cartItems.deleteMany({ cartId: cart._id })

    await this.updateCartTimestamp(cart._id)

    const updatedCart = await this.getCart(accountId)

    return {
      message: CART_MESSAGES.CART_CLEARED,
      result: updatedCart.result
    }
  }
}

const cartService = new CartService()
export default cartService
