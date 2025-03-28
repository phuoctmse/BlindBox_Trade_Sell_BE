import { ObjectId } from 'mongodb'
import { TradeStatus } from '~/constants/enums'

export interface TradePostReqBody {
  item: ObjectId
  title: string
  description: string
}

export interface TradePostStatusReqBody {
  status: TradeStatus
}

export interface ProposalReqBody {
  items: ObjectId[]
  message: string
}
