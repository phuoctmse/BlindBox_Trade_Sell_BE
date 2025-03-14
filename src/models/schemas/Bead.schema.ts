import { Double, ObjectId } from 'mongodb'

interface BeadsType {
  _id: ObjectId
  type: string
  price: Double
}

export default class Beads {
  _id: ObjectId
  type: string
  price: Double
  constructor(bead: BeadsType) {
    this._id = bead._id
    this.type = bead.type
    this.price = bead.price
  }
}
