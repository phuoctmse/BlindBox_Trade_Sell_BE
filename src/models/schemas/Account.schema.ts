import { ObjectId } from 'mongodb'
import { AccountRole, AccountVerifyStatus } from '~/constants/enums'

interface AccountsType {
  _id?: ObjectId
  userName: string
  fullName?: string
  password: string
  email: string
  phoneNumber?: string
  address?: string
  email_verify_token?: string
  forgot_password_token?: string
  verify?: AccountVerifyStatus
  role: AccountRole
  remainingCredits?: number
  isRegisterSelling?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export default class Accounts {
  _id?: ObjectId
  userName: string
  fullName: string
  password: string
  email: string
  phoneNumber: string
  address: string
  email_verify_token: string
  forgot_password_token: string
  verify: AccountVerifyStatus
  role: AccountRole
  remainingCredits: number
  isRegisterSelling: boolean
  createdAt: Date
  updatedAt: Date

  constructor(account: AccountsType) {
    const date = new Date()
    this._id = account._id
    this.userName = account.userName
    this.fullName = account.fullName || ''
    this.password = account.password
    this.email = account.email
    this.phoneNumber = account.phoneNumber || ''
    this.address = account.address || ''
    this.verify = account.verify || AccountVerifyStatus.Unverified
    this.role = account.role
    this.remainingCredits = account.remainingCredits || 0
    this.isRegisterSelling = account.isRegisterSelling || false
    this.createdAt = account.createdAt || date
    this.updatedAt = account.updatedAt || date
    this.email_verify_token = account.email_verify_token || ''
    this.forgot_password_token = account.forgot_password_token || ''
  }
}
