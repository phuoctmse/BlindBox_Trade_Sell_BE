import { ObjectId } from 'mongodb'

interface FeedbackType {
  _id: ObjectId
  rate: number
  content: string
  accountId: ObjectId
  productId: ObjectId
  accountName: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Feedbacks {
  _id: ObjectId
  rate: number
  content: string
  accountId: ObjectId
  productId: ObjectId
  accountName: string
  createdAt: Date
  updatedAt: Date

  constructor(feedback: FeedbackType) {
    const date = new Date()
    this._id = feedback._id
    this.rate = feedback.rate
    this.content = feedback.content
    this.accountId = feedback.accountId
    this.productId = feedback.productId
    this.accountName = feedback.accountName
    this.createdAt = feedback.createdAt || date
    this.updatedAt = feedback.updatedAt || date
  }
}
