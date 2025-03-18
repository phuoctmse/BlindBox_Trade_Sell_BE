import databaseServices from './database.services'
import { Double, ObjectId } from 'mongodb'
import { AccountVerifyStatus, Category, ProductStatus, TypeBeads } from '~/constants/enums'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import Beads from '~/models/schemas/Bead.schema'

class AdminService {
  async getAllAccounts() {
    const result = await databaseServices.accounts.find().toArray()
    return {
      message: 'Accounts fetched successfully',
      result
    }
  }

  async updateAccountVerifyStatus(accountId: string, verifyStatus: AccountVerifyStatus) {
    const result = await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { verify: verifyStatus } }
    )
    return {
      message: 'Account verification status updated successfully',
      result
    }
  }

  async updateBlindboxStatus(slug: string, id: string, status?: ProductStatus) {
    const result = await databaseServices.products.updateOne(
      {
        slug,
        _id: new ObjectId(id)
      },
      { $set: { status } }
    )
    return {
      message: PRODUCT_MESSAGES.PRODUCT_UPDATED_SUCCESS,
      result
    }
  }

  async createBeads(payload: CreateBeadsReqBody) {
    const newBeadId = new ObjectId();
    const bead = new Beads({
      _id: newBeadId,
      type: payload.type,
      price: payload.price
    });
  
    const result = await databaseServices.beads.insertOne(bead);
  
    return {
      message: PRODUCT_MESSAGES.BEAD_CREATED_SUCCESS,
      result
    };
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

  async updateBead(id: string, payload: CreateBeadsReqBody) {
    const result = await databaseServices.beads.updateOne({ _id: new ObjectId(id) }, { $set: { ...payload } })
    return {
      message: PRODUCT_MESSAGES.BEAD_UPDATED_SUCCESS,
      result
    }
  }

  async deleteBead(id: string) {
    const linkedProduct = await databaseServices.products.findOne({
      beadId: new ObjectId(id)
    })
    if (linkedProduct) {
      return {
        message: PRODUCT_MESSAGES.BEAD_LINKED_WITH_PRODUCT,
        result: null
      }
    }
    const result = await databaseServices.beads.deleteOne({
      _id: new ObjectId(id)
    })
    return {
      message: PRODUCT_MESSAGES.BEAD_DELETED_SUCCESS,
      result
    }
  }

  async getAllProducts() {
    const result = await databaseServices.products
      .find({})
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

const adminService = new AdminService()
export default adminService
