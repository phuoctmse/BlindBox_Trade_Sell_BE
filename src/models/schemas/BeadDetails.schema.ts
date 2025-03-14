import { ObjectId } from 'mongodb'

interface BeadDetailsType {
  _id: ObjectId
  quantity: number
  beadId: ObjectId
  totalPrice: number
  color: string
}

export default class BeadDetails {
  _id: ObjectId
  quantity: number
  totalPrice: number
  beadId: ObjectId
  color: string
  constructor(bead: BeadDetailsType) {
    this._id = bead._id
    this.quantity = bead.quantity
    this.beadId = bead.beadId
    this.color = bead.color
    this.totalPrice = bead.totalPrice
  }
}
