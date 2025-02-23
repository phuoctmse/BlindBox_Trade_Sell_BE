import { ObjectId } from 'mongodb'
import { Category } from '~/constants/enums'

interface ProductType {
  _id?: ObjectId
  name: string
  description: string
  amount: number
  isTrade?: boolean
  price: number
  category: Category
  image: string
  createdAt: Date
  updatedAt: Date
}

export default class Products {
  _id?: ObjectId
  name: string
  // feedbackId: ObjectId
  description: string
  amount: number
  isTrade: boolean
  price: number
  category: Category
  image: string
  createdAt: Date
  updatedAt: Date

  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id
    this.name = product.name
    // this.feedbackId = product.feedbackId
    this.description = product.description
    this.amount = product.amount
    this.isTrade = product.isTrade || false
    this.price = product.price
    this.category = product.category
    this.image = product.image
    this.createdAt = product.createdAt || date
    this.updatedAt = product.updatedAt || date
  }
}
