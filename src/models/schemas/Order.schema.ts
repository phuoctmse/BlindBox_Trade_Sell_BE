import { Double, ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod } from '~/constants/enums'
import { ReceiverInfo } from '../requests/Order.requests'
interface StatusHistory {
  status: OrderStatus
  timestamp: Date
  reason?: string
  cancelledItems?: {
    productName: string
    quantity: number
    price: Double
  }[]
  confirmedItems?: {
    productName: string
    quantity: number
    sellerId: ObjectId
  }[]
  processedItems?: {
    productName: string
    quantity: number
    sellerId: ObjectId
  }[]
  completedItems?: {
    productName: string
    quantity: number
    sellerId: ObjectId
  }[]
}
interface BuyerInfo {
  accountId: ObjectId
}

interface OrdersType {
  _id: ObjectId
  totalPrice: Double
  promotionId?: ObjectId
  status?: OrderStatus
  statusHistory?: StatusHistory[]
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
  statusHistory: StatusHistory[]
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
    this.statusHistory = order.statusHistory || [
      {
        status: this.status,
        timestamp: date
      }
    ]

    this.createdAt = order.createdAt || date
    this.updatedAt = order.updatedAt || date
    this.notes = order.notes || ''
    this.paymentMethod = order.paymentMethod || PaymentMethod.COD
  }
}
