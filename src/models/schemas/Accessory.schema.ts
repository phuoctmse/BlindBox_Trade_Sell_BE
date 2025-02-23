import { Double, ObjectId } from 'mongodb'

interface AccessoryType {
  productId: ObjectId
  totalPrice: Double
  size: string
  type: string
  createdAt: Date
  updatedAt: Date
}

export default class Accessories {
  productId: ObjectId
  totalPrice: Double
  size: string
  type: string
  createdAt: Date
  updatedAt: Date
  constructor(accessory: AccessoryType) {
    const date = new Date()
    this.productId = accessory.productId
    this.totalPrice = accessory.totalPrice
    this.size = accessory.size
    this.type = accessory.type
    this.createdAt = accessory.createdAt || date
    this.updatedAt = accessory.updatedAt || date
  }
}
