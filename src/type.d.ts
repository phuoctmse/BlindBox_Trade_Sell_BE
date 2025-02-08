import { Request } from 'express'
import Account from './models/schemas/Account.schema'
import { TokenPayload } from './models/requests/Account.requests'
declare module 'express' {
  interface Request {
    account?: Account
  }
}
