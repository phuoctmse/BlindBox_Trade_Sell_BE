import { Double, ObjectId } from 'mongodb'
import { Category, ProductStatus, RarityLevel } from '~/constants/enums'

interface OpenedItems {
  rarity?: RarityLevel
  condition?: number
}

interface BlindBox {
  size?: number
}

interface ProductType {
  _id?: ObjectId
  name: string
  slug: string
  description?: string
  quantity: number
  price: Double
  category: Category
  image?: string
  createdBy: ObjectId
  status?: ProductStatus
  brand?: string
  feedBack?: ObjectId[]
  openedItems?: OpenedItems
  blindBoxes?: BlindBox
  accessories?: ObjectId[]
  createdAt?: Date
  updatedAt?: Date
}

export default class Products {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  quantity: number
  price: Double
  category: Category
  image: string
  createdBy: ObjectId
  status: ProductStatus
  brand: string
  feedBack: ObjectId[]
  openedItems: OpenedItems
  blindBoxes: BlindBox
  accessories: ObjectId[]
  createdAt: Date
  updatedAt: Date

  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id
    this.name = product.name
    this.slug = product.slug
    this.description = product.description || ''
    this.quantity = product.quantity
    this.price = product.price
    this.category = product.category
    this.image = product.image || ''
    this.createdBy = product.createdBy
    this.status = product.status || ProductStatus.Inactive
    this.brand = product.brand || ''
    this.feedBack = product.feedBack || []
    this.openedItems = product.openedItems || {}
    this.blindBoxes = product.blindBoxes || {}
    this.accessories = product.accessories || []
    this.createdAt = product.createdAt || date
    this.updatedAt = product.updatedAt || date
  }
}
