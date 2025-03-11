import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import adminService from '~/services/admin.services'


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