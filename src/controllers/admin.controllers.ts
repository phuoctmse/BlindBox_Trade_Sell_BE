import { result } from 'lodash'
import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import adminService from '~/services/admin.services'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/Account.requests'
import { TradePostStatusReqBody } from '~/models/requests/Trade.requests'
import { CreditConversion } from '~/models/requests/Admin.requests'
import { TradeStatus } from '~/constants/enums'

export const getAllAccountsController = async (req: Request, res: Response) => {
  const result = await adminService.getAllAccounts()
  res.status(HTTP_STATUS.OK).json(result)
}

export const updateAccountVerifyStatusController = async (req: Request, res: Response) => {
  const { accountId } = req.params
  const { verifyStatus } = req.body
  const result = await adminService.updateAccountVerifyStatus(accountId, verifyStatus)
  res.status(HTTP_STATUS.OK).json(result)
}

export const deleteAccountController = async (req: Request, res: Response) => {
  const { accountId } = req.params
  const result = await adminService.deleteAccount(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const updateBlindboxStatusController = async (req: Request, res: Response) => {
  const { slug } = req.params
  const { id } = req.query
  const { status } = req.body
  const result = await adminService.updateBlindboxStatus(slug, id as string, status)
  res.status(HTTP_STATUS.OK).json(result)
}

export const deleteProductController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminService.deleteProduct(id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const createBeadsController = async (req: Request<ParamsDictionary, any, CreateBeadsReqBody>, res: Response) => {
  const payload = { ...req.body } as CreateBeadsReqBody
  const result = await adminService.createBeads(payload)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const getAllBeadsController = async (req: Request, res: Response) => {
  const result = await adminService.getAllBeads()
  res.status(HTTP_STATUS.OK).json(result)
}

export const getBeadsDetailsController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminService.getBeadsDetails(id as string)
  res.status(HTTP_STATUS.OK).json(result)
}

export const updateBeadsController = async (req: Request<ParamsDictionary, any, CreateBeadsReqBody>, res: Response) => {
  const { id } = req.params
  const payload = { ...req.body }
  const result = await adminService.updateBead(id, payload)
  res.status(HTTP_STATUS.OK).json(result)
}

export const deleteBeadsController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminService.deleteBead(id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getAllFeedbackController = async (req: Request, res: Response) => {
  const result = await adminService.getAllFeedbacks()
  res.status(HTTP_STATUS.OK).json(result)
}

export const deleteFeedbackController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminService.deleteFeedback(id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getAllProductController = async (req: Request, res: Response) => {
  const result = await adminService.getAllProducts()
  res.status(HTTP_STATUS.OK).json(result)
}

export const getAllTradePostsController = async (req: Request, res: Response) => {
  const result = await adminService.getAllTradePosts()
  res.status(HTTP_STATUS.OK).json(result)
}

export const UpdateTradePostStatusController = async (
  req: Request<ParamsDictionary, any, TradePostStatusReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { status } = req.body
  if (status !== TradeStatus.Cancelled && status !== TradeStatus.Approved) {
    throw new Error('Invalid status')
  }
  const result = await adminService.updateTradePostStatus(id, status)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getTradePostsDetailsController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminService.getTradePostDetails(id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getCreditConversionController = async (req: Request, res: Response) => {
  const result = await adminService.getCreditConversion()
  res.status(HTTP_STATUS.OK).json(result)
}

export const updateCreditConversionController = async (
  req: Request<ParamsDictionary, any, CreditConversion>,
  res: Response
) => {
  const payload = { ...req.body }
  const result = await adminService.updateCreditConversion(payload)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getProductWithAccessoriesController = async (req: Request, res: Response) => {
  const result = await adminService.getProductWithAccessories()
  res.status(HTTP_STATUS.OK).json(result)
}
