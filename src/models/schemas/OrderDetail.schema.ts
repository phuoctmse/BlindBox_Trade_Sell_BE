import { Double, ObjectId } from 'mongodb'

interface OrderDetailsType {
  _id?: ObjectId
  orderId: ObjectId
  productName: string
  quantity: number
  price: Double
  image: string
}

export default class OrderDetails {
  _id: ObjectId
  orderId: ObjectId
  productName: string
  quantity: number
  price: Double
  image: string
  constructor(orderDetail: OrderDetailsType) {
    this._id = orderDetail._id || new ObjectId()
    this.orderId = orderDetail.orderId
    this.productName = orderDetail.productName
    this.quantity = orderDetail.quantity
    this.price = orderDetail.price
    this.image = orderDetail.image
  }
}
