import { Double } from 'mongodb'

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
  type: string
  price: Double
}