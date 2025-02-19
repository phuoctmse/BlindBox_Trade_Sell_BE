import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  create_at?: Date
  account_id: ObjectId
  iat: number
  exp: number
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  create_at: Date
  account_id: ObjectId
  iat: Date
  exp: Date
  constructor({ _id, token, create_at, account_id, iat, exp }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.create_at = create_at || new Date()
    this.account_id = account_id
    this.iat = new Date(iat * 1000) //Convert epoch time to Date
    this.exp = new Date(exp * 1000)
  }
}
