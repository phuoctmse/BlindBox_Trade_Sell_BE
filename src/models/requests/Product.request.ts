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
  type: TypeBeads
  price: number
}

export interface CreateAccessoriesReqBody {
  customItems: [
    {
      color: string
      quantity: number
      beadId: string
    }
  ],
  image: string
}
