import { ObjectId } from 'mongodb'

interface BeadDetails {
  quantity: number
  beadId: ObjectId
}
interface ComponentType {
  _id: ObjectId
  quantity: number
  totalPrice: number
  beads: BeadDetails
}

export default class Components {
  _id: ObjectId
  quantity: number
  totalPrice: number
  beads: BeadDetails
  constructor(component: ComponentType) {
    this._id = component._id
    this.quantity = component.quantity
    this.totalPrice = component.totalPrice
    this.beads = component.beads
  }
}
