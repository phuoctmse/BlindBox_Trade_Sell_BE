import { Double, ObjectId } from 'mongodb'
import { OrderStatus } from '~/constants/enums'

interface OrderDetailsType {
  _id?: ObjectId
  orderId: ObjectId
  productId: ObjectId
  productName: string
  quantity: number
  price: Double
  image: string
  sellerId: ObjectId
  status?: OrderStatus
}

export default class OrderDetails {
  _id: ObjectId
  orderId: ObjectId
  productId: ObjectId
  productName: string
  quantity: number
  price: Double
  image: string
  sellerId: ObjectId
  status: OrderStatus

  constructor(orderDetail: OrderDetailsType) {
    this._id = orderDetail._id || new ObjectId()
    this.orderId = orderDetail.orderId
    this.productName = orderDetail.productName
    this.productId = orderDetail.productId
    this.quantity = orderDetail.quantity
    this.price = orderDetail.price
    this.image = orderDetail.image
    this.sellerId = orderDetail.sellerId
    this.status = orderDetail.status || OrderStatus.Pending
  }
}
