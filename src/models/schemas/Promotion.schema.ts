import { ObjectId } from 'mongodb'

interface PromotionType {
  _id?: ObjectId
  name: string
  discountRate: number
  discountAmount?: number
  maxDiscountAmount?: number
  startDate: Date
  endDate: Date
  sellerId: ObjectId
  isActive?: boolean
  singleUse?: boolean
  assignedTo?: ObjectId
  used?: boolean
}

export default class Promotions {
  _id: ObjectId
  name: string
  discountRate: number
  discountAmount: number
  maxDiscountAmount?: number
  startDate: Date
  endDate: Date
  sellerId: ObjectId
  isActive: boolean
  singleUse: boolean
  assignedTo?: ObjectId
  used: boolean

  constructor(promotion: PromotionType) {
    this._id = promotion._id || new ObjectId()
    this.name = promotion.name
    this.discountRate = promotion.discountRate
    this.discountAmount = promotion.discountAmount || 0
    this.maxDiscountAmount = promotion.maxDiscountAmount
    this.startDate = promotion.startDate
    this.endDate = promotion.endDate
    this.sellerId = promotion.sellerId
    this.isActive = promotion.isActive || false
    this.singleUse = promotion.singleUse || false
    this.assignedTo = promotion.assignedTo
    this.used = promotion.used || false
  }
}
