import { ObjectId } from 'mongodb'

interface BlindboxType {
  productId: ObjectId
  isUnboxed: boolean
  rarity: string
  brand: string
  createdAt: Date
  updatedAt: Date
}

export default class Blindboxs {
  productId: ObjectId
  isUnboxed: boolean
  rarity: string
  brand: string
  createdAt: Date
  updatedAt: Date
  constructor(blindbox: BlindboxType) {
    const date = new Date()
    this.productId = blindbox.productId
    this.isUnboxed = blindbox.isUnboxed || false
    this.rarity = blindbox.rarity
    this.brand = blindbox.brand
    this.createdAt = blindbox.createdAt || date
    this.updatedAt = blindbox.updatedAt || date
  }
}
