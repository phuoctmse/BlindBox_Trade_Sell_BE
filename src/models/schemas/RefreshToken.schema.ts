import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  create_at?: Date
  account_id: ObjectId
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  create_at: Date
  account_id: ObjectId
  constructor({ _id, token, create_at, account_id }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.create_at = create_at || new Date()
    this.account_id = account_id
  }
}
