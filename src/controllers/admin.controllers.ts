import { result } from 'lodash'
import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import adminService from '~/services/admin.services'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/Account.requests'

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

export const updateBlindboxStatusController = async (req: Request, res: Response) => {
  const { slug } = req.params
  const { id } = req.query
  const { status } = req.body
  const result = await adminService.updateBlindboxStatus(slug, id as string, status)
  res.status(HTTP_STATUS.OK).json(result)
}

export const createBeadsController = async (req: Request<ParamsDictionary, any, CreateBeadsReqBody>, res: Response) => {
  const payload = { ...req.body } as CreateBeadsReqBody
  const result = await adminService.createBead(payload)
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

export const getAllProductController = async (req: Request, res: Response) => {
  const result = await adminService.getAllProducts()
  res.status(HTTP_STATUS.OK).json(result)
}
