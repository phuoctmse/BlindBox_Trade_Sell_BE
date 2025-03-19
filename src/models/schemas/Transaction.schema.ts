import { ObjectId } from 'mongodb'
import { PaymentStatus } from '~/constants/enums'

interface TransactionsType {
  _id?: ObjectId
  accountId: ObjectId
  transferAmount: number
  status: PaymentStatus
  transactionDate: Date
  gateway: string
  content: string
}

export default class Transactions {
  _id: ObjectId
  accountId: ObjectId
  transferAmount: number
  status: PaymentStatus
  transactionDate: Date
  gateway: string
  content: string
  constructor(transaction: TransactionsType) {
    this._id = transaction._id || new ObjectId()
    this.accountId = transaction.accountId
    this.transferAmount = transaction.transferAmount
    this.status = transaction.status
    this.transactionDate = transaction.transactionDate
    this.gateway = transaction.gateway
    this.content = transaction.content
  }
}
