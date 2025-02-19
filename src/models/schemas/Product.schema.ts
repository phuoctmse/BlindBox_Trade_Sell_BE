import { ObjectId } from 'mongodb'

interface ProductType {
  _id?: ObjectId
  name: string
  feedbackId: ObjectId
  description: string
  amount: number
  isTrade: boolean
  price: number
  image: string
  createdAt: Date
  updatedAt: Date
}

export default class Products {
  _id?: ObjectId
  name: string
  feedbackId: ObjectId
  description: string
  amount: number
  isTrade: boolean
  price: number
  image: string
  createdAt: Date
  updatedAt: Date

  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id
    this.name = product.name
    this.feedbackId = product.feedbackId
    this.description = product.description
    this.amount = product.amount
    this.isTrade = product.isTrade
    this.price = product.price
    this.image = product.image
    this.createdAt = product.createdAt || date
    this.updatedAt = product.updatedAt || date
  }
}
