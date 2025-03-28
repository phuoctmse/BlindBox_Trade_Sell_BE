import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import adminService from '~/services/admin.services'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/Account.requests'
import { TradePostStatusReqBody } from '~/models/requests/Trade.requests'
import { CreditConversion } from '~/models/requests/Admin.requests'
import { TradeStatus } from '~/constants/enums'

class AdminController {
  async getAllAccounts(req: Request, res: Response) {
    const result = await adminService.getAllAccounts()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async updateAccountVerifyStatus(req: Request, res: Response) {
    const { accountId } = req.params
    const { verifyStatus } = req.body
    const result = await adminService.updateAccountVerifyStatus(accountId, verifyStatus)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deleteAccount(req: Request, res: Response) {
    const { accountId } = req.params
    const result = await adminService.deleteAccount(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async updateBlindboxStatus(req: Request, res: Response) {
    const { slug } = req.params
    const { id } = req.query
    const { status } = req.body
    const result = await adminService.updateBlindboxStatus(slug, id as string, status)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deleteProduct(req: Request, res: Response) {
    const { id } = req.params
    const result = await adminService.deleteProduct(id)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createBeads(req: Request<ParamsDictionary, any, CreateBeadsReqBody>, res: Response) {
    const payload = { ...req.body } as CreateBeadsReqBody
    const result = await adminService.createBeads(payload)
    res.status(HTTP_STATUS.CREATED).json(result)
  }

  async getAllBeads(req: Request, res: Response) {
    const result = await adminService.getAllBeads()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getBeadsDetails(req: Request, res: Response) {
    const { id } = req.params
    const result = await adminService.getBeadsDetails(id as string)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async updateBeads(req: Request<ParamsDictionary, any, CreateBeadsReqBody>, res: Response) {
    const { id } = req.params
    const payload = { ...req.body }
    const result = await adminService.updateBead(id, payload)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deleteBeads(req: Request, res: Response) {
    const { id } = req.params
    const result = await adminService.deleteBead(id)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getAllFeedback(req: Request, res: Response) {
    const result = await adminService.getAllFeedbacks()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deleteFeedback(req: Request, res: Response) {
    const { id } = req.params
    const result = await adminService.deleteFeedback(id)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getAllProduct(req: Request, res: Response) {
    const result = await adminService.getAllProducts()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getAllTradePosts(req: Request, res: Response) {
    const result = await adminService.getAllTradePosts()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async updateTradePostStatus(req: Request<ParamsDictionary, any, TradePostStatusReqBody>, res: Response) {
    const { id } = req.params
    const { status } = req.body
    if (status !== TradeStatus.Cancelled && status !== TradeStatus.Approved) {
      throw new Error('Invalid status')
    }
    const result = await adminService.updateTradePostStatus(id, status)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getTradePostsDetails(req: Request, res: Response) {
    const { id } = req.params
    const result = await adminService.getTradePostDetails(id)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getCreditConversion(req: Request, res: Response) {
    const result = await adminService.getCreditConversion()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async updateCreditConversion(req: Request<ParamsDictionary, any, CreditConversion>, res: Response) {
    const payload = { ...req.body }
    const result = await adminService.updateCreditConversion(payload)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getProductWithAccessories(req: Request, res: Response) {
    const result = await adminService.getProductWithAccessories()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getDashboardStats(req: Request, res: Response) {
    const result = await adminService.getDashboardStats()
    res.status(HTTP_STATUS.OK).json(result)
  }
}

const adminController = new AdminController()

export default adminController
