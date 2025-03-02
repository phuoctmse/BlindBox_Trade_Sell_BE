import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import { Category } from '~/constants/enums'
import Products from '~/models/schemas/Product.schema'
import { PRODUCT_MESSAGES } from '~/constants/messages'

class ProductService {
  async getProducts() {}

  async createBlindBoxes(payload: CreateBlindBoxesReqBody, accountId: string) {
    const newProductId = new ObjectId()
    const result = await databaseServices.products.insertOne(
      new Products({
        ...payload,
        _id: newProductId,
        createdBy: new ObjectId(accountId),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: Category.Blindbox,
        blindBoxes: {
          size: payload.size
        }
      })
    )
    return {
      message: PRODUCT_MESSAGES.PRODUCT_CREATED_SUCCESS
    }
  }
}

const productService = new ProductService()
export default productService
