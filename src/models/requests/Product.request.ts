import { Double, ObjectId } from 'mongodb'
import { TypeBeads } from '~/constants/enums'

export interface CreateBlindBoxesReqBody {
  image: string
  name: string
  description: string
  quantity: number
  price: Double
  brand: string
  size: number
}

export interface CreateBeadsReqBody {
  color: string
  type: TypeBeads
  price: Double
}

export interface CreateAccessoriesReqBody {
  customItems: [
    {
      color: string
      quantity: number
      beadId: string
    }
  ]
  image: string
}
