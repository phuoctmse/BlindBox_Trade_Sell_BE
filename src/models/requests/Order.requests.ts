import { OrderType, PaymentMethod } from '~/constants/enums'

export interface ReceiverInfo {
  fullName: string
  phoneNumber: string
  address: string
}

export interface CartOrderItem {
  itemId: string // ID của cart item
  quantity: number
}

export interface DirectOrderItem {
  productId: string
  quantity: number
}

interface BaseOrderReqBody {
  receiverInfo?: ReceiverInfo
  promotionId?: string
  notes?: string
  paymentMethod: PaymentMethod
}

export interface DirectOrderReqBody extends BaseOrderReqBody {
  orderType: OrderType.Direct
  item: DirectOrderItem
}

export interface CartOrderReqBody extends BaseOrderReqBody {
  orderType: OrderType.Cart
  items: CartOrderItem[]
}

export type CreateOrderReqBody = DirectOrderReqBody | CartOrderReqBody
