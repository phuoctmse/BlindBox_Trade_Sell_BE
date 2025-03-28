import { ObjectId } from 'mongodb'
import { TradeStatus } from '~/constants/enums'

interface TradeProposalType {
  _id?: ObjectId
  postId: ObjectId
  proposerId: ObjectId
  items: ObjectId[]
  status?: TradeStatus
  message: string
  parentProposalId?: ObjectId
  isCounterOffer?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export default class TradeProposals {
  _id: ObjectId
  postId: ObjectId
  proposerId: ObjectId
  items: ObjectId[]
  status: TradeStatus
  message: string
  parentProposalId?: ObjectId
  isCounterOffer: boolean
  createdAt: Date
  updatedAt: Date

  constructor(tradeProposal: TradeProposalType) {
    const date = new Date()
    this._id = tradeProposal._id || new ObjectId()
    this.postId = tradeProposal.postId
    this.proposerId = tradeProposal.proposerId
    this.items = tradeProposal.items
    this.status = tradeProposal.status || TradeStatus.Sent
    this.message = tradeProposal.message
    this.parentProposalId = tradeProposal.parentProposalId
    this.isCounterOffer = tradeProposal.isCounterOffer || false
    this.createdAt = tradeProposal.createdAt || date
    this.updatedAt = tradeProposal.updatedAt || date
  }
}
