import { Request, Router } from 'express'
import Account from './models/schemas/Account.schema'
import { TokenPayload } from './models/requests/Account.requests'
declare module 'express' {
  interface Request {
    account?: Account
    decode_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verified_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
