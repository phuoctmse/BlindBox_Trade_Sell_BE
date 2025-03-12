export interface AddToCartReqBody {
  productId: string
  quantity: number
}

export interface UpdateCartItemReqBody {
  quantity: number
}