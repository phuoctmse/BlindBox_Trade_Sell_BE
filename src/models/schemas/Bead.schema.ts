import { Double, ObjectId } from 'mongodb'
import { TypeBeads } from '~/constants/enums'

interface BeadsType {
  _id: ObjectId
  type: TypeBeads
  price: Double
}

export default class Beads {
  _id: ObjectId
  type: TypeBeads
  price: Double
  constructor(bead: BeadsType) {
    this._id = bead._id
    this.type = bead.type
    this.price = bead.price
  }
}
