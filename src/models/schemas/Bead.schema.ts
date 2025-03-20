import { ObjectId } from 'mongodb'
import { TypeBeads } from '~/constants/enums'

interface BeadsType {
  _id: ObjectId
  type: TypeBeads
  price: number
}

export default class Beads {
  _id: ObjectId
  type: TypeBeads
  price: number
  constructor(bead: BeadsType) {
    this._id = bead._id
    this.type = bead.type
    this.price = bead.price
  }
}
