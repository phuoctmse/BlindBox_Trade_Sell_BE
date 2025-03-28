import { ObjectId } from 'mongodb'

export interface CreateFeedbackReqBody {
  accountId: ObjectId
  productId: ObjectId
  rate: number
  content: string
}
