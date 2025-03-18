import { ObjectId } from 'mongodb'

interface CreditConversionsType {
  _id?: ObjectId
  rate: number
  creditCharged: number
  updatedAt: Date
}

export default class CreditConversions {
  _id: ObjectId
  rate: number
  creditCharged: number
  updatedAt: Date
  constructor(creditConversion: CreditConversionsType) {
    this._id = creditConversion._id || new ObjectId()
    this.rate = creditConversion.rate
    this.creditCharged = creditConversion.creditCharged
    this.updatedAt = creditConversion.updatedAt
  }
}
