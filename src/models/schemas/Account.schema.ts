import { ObjectId } from 'mongodb'
import { AccountRole, AccountVerifyStatus } from '~/constants/enums'

interface AccountsType {
  _id?: ObjectId
  userName: string
  password: string
  email: string
  phoneNumber?: string
  address?: string
  email_verify_token?: string
  forgot_password_token?: string
  verify?: AccountVerifyStatus
  role: AccountRole
  // bio: string
  // location: string
  // avatar: string
  // cover_photo: string
  createdAt?: Date
  updateAt?: Date
}

export default class Accounts {
  _id?: ObjectId
  userName: string
  password: string
  email: string
  phoneNumber: string
  address: string
  email_verify_token: string
  forgot_password_token: string
  verify: AccountVerifyStatus
  role: AccountRole
  // bio: string
  // location: string
  // avatar: string
  // cover_photo: string
  createdAt: Date
  updateAt: Date

  constructor(account: AccountsType) {
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
    this.email_verify_token = account.email_verify_token || ''
    this.forgot_password_token = account.forgot_password_token || ''
  }
}
