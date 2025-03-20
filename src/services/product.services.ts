import { Double, ObjectId } from 'mongodb'
import slugify from 'slugify'
import databaseServices from './database.services'
import {
  CreateAccessoriesReqBody,
  CreateBeadsReqBody,
  CreateBlindBoxesReqBody,
  CreateOpenedItem
} from '~/models/requests/Product.request'
import { Category, ProductStatus } from '~/constants/enums'
import Products from '~/models/schemas/Product.schema'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import BeadDetails from '~/models/schemas/BeadDetails.schema'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
config()

class ProductService {
  async getMyBlindBoxes(accountId: string) {
    const result = await databaseServices.products
      .find({
        category: Category.Blindbox,
        createdBy: new ObjectId(accountId)
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
      _id: new ObjectId(id),
      category: Category.Blindbox
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

  async getAllApprovedBlindboxes() {
    const result = await databaseServices.products
      .find({
        category: Category.Blindbox,
        status: 1
      })
      .toArray()
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result
    }
  }

  async updateProduct(id: string, payload: CreateBlindBoxesReqBody) {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID }
    }
    if (!payload || typeof payload !== 'object') {
      return { success: false, message: PRODUCT_MESSAGES.INVALID_PAYLOAD }
    }
    const updatePayload: CreateBlindBoxesReqBody = {
      ...payload
    }
    const result = await databaseServices.products.updateOne({ _id: new ObjectId(id) }, { $set: updatePayload })
    if (result.matchedCount === 0) {
      return { success: false, message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND }
    }
    return {
      message: PRODUCT_MESSAGES.PRODUCT_UPDATED_SUCCESS
    }
  }

  async deleteProduct(id: string) {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID }
    }
    const objectId = new ObjectId(id)
    const result = await databaseServices.products.deleteOne({ _id: objectId })
    if (result.deletedCount === 0) {
      return { success: false, message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND }
    }
    return { success: true, message: PRODUCT_MESSAGES.PRODUCT_DELETED_SUCCESS }
  }

  private async createBeadDetail(
    beadId: string,
    color: string,
    quantity: number
  ): Promise<{
    detailId: ObjectId
    totalPrice: number
  }> {
    const bead = await databaseServices.beads.findOne({ _id: new ObjectId(beadId) })
    if (!bead) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PRODUCT_MESSAGES.BEAD_NOT_FOUND
      })
    }
    const totalPrice = Number(bead.price) * quantity

    const newBeadDetailId = new ObjectId()
    await databaseServices.beadDetails.insertOne(
      new BeadDetails({
        _id: newBeadDetailId,
        beadId: new ObjectId(beadId),
        color,
        quantity,
        totalPrice
      })
    )

    return { detailId: newBeadDetailId, totalPrice }
  }

  private async createAccessoryProduct(
    beadDetails: ObjectId[],
    name: string,
    description: string,
    image: string,
    price: Double,
    accountId: string
  ): Promise<ObjectId> {
    const slug = slugify(name, { lower: true, strict: true })

    // Tạo sản phẩm mới
    const newProductId = new ObjectId()
    await databaseServices.products.insertOne(
      new Products({
        _id: newProductId,
        name,
        description,
        image,
        category: Category.Accessory,
        createdBy: new ObjectId(accountId),
        quantity: 1,
        price,
        status: ProductStatus.Active,
        accessories: beadDetails,
        slug,
        brand: 'BlindB!ox',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    )

    return newProductId
  }

  /////////
  async createAccessories(payload: CreateAccessoriesReqBody, accountId: string) {
    const { customItems, image } = payload

    const beadDetailIds: ObjectId[] = []
    let totalAccessoryPrice = 0

    const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'User not found'
      })
    }

    const userIdentifier = user.userName

    const beadNames = []
    const beadColors = new Set<string>()

    for (const item of customItems) {
      const result = await this.createBeadDetail(item.beadId, item.color, item.quantity)
      beadDetailIds.push(result.detailId)
      totalAccessoryPrice += result.totalPrice

      // Lấy thông tin về bead để tạo tên sản phẩm có ý nghĩa
      const bead = await databaseServices.beads.findOne({ _id: new ObjectId(item.beadId) })
      if (bead && bead.type) {
        beadNames.push(bead.type)
      }
      beadColors.add(item.color)
    }
    let productName = ''
    productName += `${userIdentifier}'s `

    productName += 'Custom Accessory'

    if (beadNames.length > 0) {
      const limitedBeadNames = beadNames.slice(0, 2)
      if (limitedBeadNames.length > 0) {
        productName += ` with ${limitedBeadNames.join(', ')}`
        if (beadNames.length > 2) {
          productName += ` and ${beadNames.length - 2} more`
        }
      }
    }

    if (beadColors.size > 0) {
      const colorArray = Array.from(beadColors)
      if (colorArray.length <= 3) {
        productName += ` (${colorArray.join(', ')})`
      } else {
        productName += ` (${colorArray.slice(0, 2).join(', ')} and ${colorArray.length - 2} more colors)`
      }
    }

    const date = new Date()
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear().toString().slice(2)}`
    productName += ` - ${formattedDate}`

    const description = `Custom accessory created by ${userIdentifier} `

    const productId = await this.createAccessoryProduct(
      beadDetailIds,
      productName,
      description,
      image,
      new Double(totalAccessoryPrice),
      accountId
    )

    return {
      message: PRODUCT_MESSAGES.PRODUCT_CREATED_SUCCESS,
      productId
    }
  }

  async getAllBeads() {
    const result = await databaseServices.beads.find().toArray()
    return {
      message: PRODUCT_MESSAGES.BEAD_FETCHED_SUCCESS,
      result
    }
  }

  async getBeadsDetails(id: string) {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID }
    }
    const result = await databaseServices.beads.findOne({
      _id: new ObjectId(id)
    })
    if (!result) {
      return { success: false, message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND }
    }
    return {
      success: true,
      message: PRODUCT_MESSAGES.BEAD_FETCHED_SUCCESS,
      result
    }
  }

  async getAccessoryDetail(slug: string, id: string) {
    if (!slug || !id || !ObjectId.isValid(id)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID
      })
    }

    const product = await databaseServices.products.findOne({
      slug,
      _id: new ObjectId(id),
      category: Category.Accessory
    })

    if (!product) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      })
    }

    const beadDetailIds = product.accessories || []

    if (beadDetailIds.length === 0) {
      return {
        message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
        result: {
          product,
          beadDetails: []
        }
      }
    }

    const objectIdArray = beadDetailIds.map((id) => (id instanceof ObjectId ? id : new ObjectId(id)))

    const beadDetails = await databaseServices.beadDetails.find({ _id: { $in: objectIdArray } }).toArray()

    const beadDetailsWithInfo = await Promise.all(
      beadDetails.map(async (detail) => {
        const bead = await databaseServices.beads.findOne({
          _id: detail.beadId instanceof ObjectId ? detail.beadId : ObjectId.createFromHexString(detail.beadId)
        })

        return {
          ...detail,
          beadInfo: bead
            ? {
                _id: bead._id,
                type: bead.type,
                price: bead.price
              }
            : null
        }
      })
    )

    const totalQuantity = beadDetailsWithInfo.reduce((sum, detail) => sum + detail.quantity, 0)
    const totalPrice = beadDetailsWithInfo.reduce((sum, detail) => sum + detail.totalPrice, 0)

    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: {
        product,
        beadDetails: beadDetailsWithInfo,
        summary: {
          totalBeads: beadDetailsWithInfo.length,
          totalQuantity,
          totalPrice
        }
      }
    }
  }

  async getAllOpenedItems() {
    const result = await databaseServices.products
      .find({
        category: Category.OpenedItems
      })
      .toArray()
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result
    }
  }
  async createOpenedItem(payload: CreateOpenedItem, accountId: string) {
    const newProductId = new ObjectId()
    const slug = slugify(payload.name, { lower: true, strict: true })
    const result = await databaseServices.products.insertOne(
      new Products({
        ...payload,
        _id: newProductId,
        createdBy: new ObjectId(accountId),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: Category.OpenedItems,
        slug
      })
    )
    return {
      message: PRODUCT_MESSAGES.PRODUCT_CREATED_SUCCESS,
      result
    }
  }
}
const productService = new ProductService()
export default productService
