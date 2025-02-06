import { ObjectId } from 'mongodb'
import { AccountRole, AccountVerifyStatus } from '~/constants/enums'

interface AccountType {
  _id?: ObjectId
  userName: string
  password: string
  email: string
  phoneNumber?: string
  address?: string
  verify?: AccountVerifyStatus
  role: AccountRole
  // bio: string
  // location: string
  // avatar: string
  // cover_photo: string
  createdAt?: Date
  updateAt?: Date
}

export default class Account {
  _id?: ObjectId
  userName: string
  password: string
  email: string
  phoneNumber: string
  address: string
  verify: AccountVerifyStatus
  role: AccountRole
  // bio: string
  // location: string
  // avatar: string
  // cover_photo: string
  createdAt: Date
  updateAt: Date

  constructor(account: AccountType) {
    const date = new Date()
    this._id = account._id
    this.userName = account.userName
    this.password = account.password
    this.email = account.email
    this.phoneNumber = account.phoneNumber || ''
    this.address = account.address || ''
    this.verify = account.verify || AccountVerifyStatus.Unverified
    this.role = account.role
    // this.bio = account.bio
    // this.location = account.location
    // this.avatar = account.avatar
    // this.cover_photo = account.cover_photo
    this.createdAt = account.createdAt || date
    this.updateAt = account.updateAt || date
  }
}
