import { ObjectId } from "mongodb"

interface PromotionType {
  _id?: ObjectId
  name: string
  discountRate: number
  startDate: Date
  endDate: Date
  sellerId: ObjectId
  isActive?: boolean
}

export default class Promotions {
  _id: ObjectId
  name: string
  discountRate: number
  startDate: Date
  endDate: Date
  sellerId: ObjectId
  isActive: boolean
  constructor(promotion: PromotionType) {
    this._id = promotion._id || new ObjectId()
    this.name = promotion.name
    this.discountRate = promotion.discountRate
    this.startDate = promotion.startDate
    this.endDate = promotion.endDate
    this.sellerId = promotion.sellerId
    this.isActive = promotion.isActive || false
  }
}