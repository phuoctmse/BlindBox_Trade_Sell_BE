import { Double, ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod } from '~/constants/enums'
import { ReceiverInfo } from '../requests/Order.requests'

interface BuyerInfo {
  accountId: ObjectId
}

interface OrdersType {
  _id: ObjectId
  totalPrice: Double
  promotionId?: ObjectId
  status?: OrderStatus
  buyerInfo: BuyerInfo
  receiverInfo: ReceiverInfo
  paymentMethod?: PaymentMethod
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Orders {
  _id: ObjectId
  totalPrice: Double
  promotionId?: ObjectId
  status: OrderStatus
  buyerInfo: BuyerInfo
  receiverInfo: ReceiverInfo
  paymentMethod: PaymentMethod
  notes: string
  createdAt: Date
  updatedAt: Date
  constructor(order: OrdersType) {
    const date = new Date()
    this._id = order._id
    this.totalPrice = order.totalPrice
    if (order.promotionId) {
      this.promotionId = order.promotionId
    }
    this.buyerInfo = order.buyerInfo
    this.receiverInfo = order.receiverInfo
    this.status = order.status || OrderStatus.Pending
    this.createdAt = order.createdAt || date
    this.updatedAt = order.updatedAt || date
    this.notes = order.notes || ''
    this.paymentMethod = order.paymentMethod || PaymentMethod.COD
  }
}
