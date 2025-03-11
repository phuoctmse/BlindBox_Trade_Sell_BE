import { ObjectId } from 'mongodb'

interface CartType {
  _id: ObjectId
  accountId: ObjectId
  createdAt?: Date
}

export default class Cart {
  _id: ObjectId
  accountId: ObjectId
  createdAt: Date
  constructor(cart: CartType) {
    const date = new Date()
    this._id = cart._id
    this.accountId = cart.accountId
    this.createdAt = cart.createdAt || date
  }
}
