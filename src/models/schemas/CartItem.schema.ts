import { ObjectId } from 'mongodb'

interface CartItemType {
  _id: ObjectId
  productId: ObjectId
  quantity: number
  cartId: ObjectId
  createdAt?: Date
}

export default class CartItem {
  _id: ObjectId
  productId: ObjectId
  quantity: number
  cartId: ObjectId
  createdAt: Date

  constructor(cartItem: CartItemType) {
    const date = new Date()
    this._id = cartItem._id
    this.productId = cartItem.productId
    this.quantity = cartItem.quantity
    this.cartId = cartItem.cartId
    this.createdAt = cartItem.createdAt || date
  }
}
