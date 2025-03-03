import { ObjectId } from 'mongodb'
import slugify from 'slugify'
import databaseServices from './database.services'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import { Category } from '~/constants/enums'
import Products from '~/models/schemas/Product.schema'
import { PRODUCT_MESSAGES } from '~/constants/messages'

class ProductService {
  async getMyBlindBoxes(accountId: string) {
    const result = await databaseServices.products
      .find({
        category: Category.Blindbox,
        createdBy: new ObjectId(accountId)
      })
      .project({
        _id: 1,
        name: 1
      })
      .toArray()

    const formattedResult = result.map((product) => ({
      ...product,
      _id: product._id.toString()
    }))
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: formattedResult
    }
  }

  async createBlindBoxes(payload: CreateBlindBoxesReqBody, accountId: string) {
    const newProductId = new ObjectId()
    const slug = slugify(payload.name, { lower: true, strict: true })
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
        },
        slug
      })
    )
    return {
      message: PRODUCT_MESSAGES.PRODUCT_CREATED_SUCCESS
    }
  }

  async getBlindBoxesDetails(slug: string, id: string) {
    const result = await databaseServices.products.findOne({
      slug,
      _id: new ObjectId(id)
    })
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result
    }
  }

  async getAllBlindBoxes() {
    const result = await databaseServices.products
      .find({
        category: Category.Blindbox
      })
      // .project({
      //   _id: 1,
      //   name: 1
      // })
      .toArray()

    const formattedResult = result.map((product) => ({
      ...product,
      _id: product._id.toString()
    }))
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: formattedResult
    }
  }
}

const productService = new ProductService()
export default productService
