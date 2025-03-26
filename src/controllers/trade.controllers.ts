import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/Account.requests'
import tradeService from '~/services/trade.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ProposalReqBody, TradePostReqBody } from '~/models/requests/Trade.requests'

export const getAllTradesController = async (req: Request, res: Response) => {
  const result = await tradeService.getAllTrades()
  res.status(HTTP_STATUS.OK).json(result)
}

export const getMyTradesController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await tradeService.getMyTrades(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const createTradeController = async (req: Request<ParamsDictionary, any, TradePostReqBody>, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const payload = req.body
  const result = await tradeService.createTrade(payload, accountId)
  res.status(HTTP_STATUS.CREATED).json(result)
}

export const getTradeDetailsController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await tradeService.getTradeDetails(id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const proposeTradeController = async (req: Request<ParamsDictionary, any, ProposalReqBody>, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const payload = req.body
  const result = await tradeService.proposeTrade(id, accountId, payload)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getTradeProposalsController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { postId } = req.params
  const result = await tradeService.getTradeProposals(postId, accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const getMyProposalsController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const result = await tradeService.getMyProposals(accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const counterOfferController = async (req: Request<ParamsDictionary, any, ProposalReqBody>, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { proposalId } = req.params
  const payload = req.body
  const result = await tradeService.createCounterOffer(proposalId, accountId, payload)
  res.status(HTTP_STATUS.OK).json(result)
}

export const acceptProposalController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { proposalId } = req.params
  const result = await tradeService.acceptProposal(proposalId, accountId)
  res.status(HTTP_STATUS.OK).json(result)
}

export const rejectProposalController = async (req: Request, res: Response) => {
  const { accountId } = req.decode_authorization as TokenPayload
  const { proposalId } = req.params
  const result = await tradeService.rejectProposal(proposalId, accountId)
  res.status(HTTP_STATUS.OK).json(result)
}
