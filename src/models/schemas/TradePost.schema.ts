import { ObjectId } from 'mongodb'
import { TradeStatus } from '~/constants/enums'

interface TradePostType {
  _id?: ObjectId
  authorId: ObjectId
  item: ObjectId
  title: string
  description: string
  status?: TradeStatus
  proposalId?: ObjectId[]
  createdAt?: Date
  updatedAt?: Date
}

export default class TradePosts {
  _id: ObjectId
  authorId: ObjectId
  item: ObjectId
  title: string
  description: string
  status: TradeStatus
  proposalId: ObjectId[]
  createdAt: Date
  updatedAt: Date

  constructor(tradePost: TradePostType) {
    const date = new Date()
    this._id = tradePost._id || new ObjectId()
    this.authorId = tradePost.authorId
    this.item = tradePost.item
    this.title = tradePost.title
    this.description = tradePost.description
    this.status = tradePost.status || TradeStatus.Processing
    this.proposalId = tradePost.proposalId || []
    this.createdAt = tradePost.createdAt || date
    this.updatedAt = tradePost.updatedAt || date
  }
}
