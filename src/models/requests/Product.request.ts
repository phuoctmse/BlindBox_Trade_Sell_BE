import { Double } from 'mongodb'

export interface CreateBlindBoxesReqBody {
  name: string
  description: string
  quantity: number
  price: Double
  brand: string
  size: number
}
