import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/Account.requests'
import tradeService from '~/services/trade.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ProposalReqBody, TradePostReqBody } from '~/models/requests/Trade.requests'

class TradeController {
  async getAllTrades(req: Request, res: Response) {
    const result = await tradeService.getAllTrades()
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getMyTrades(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await tradeService.getMyTrades(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createTrade(req: Request<ParamsDictionary, any, TradePostReqBody>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const payload = req.body
    const result = await tradeService.createTrade(payload, accountId)
    res.status(HTTP_STATUS.CREATED).json(result)
  }

  async getTradeDetails(req: Request, res: Response) {
    const { id } = req.params
    const result = await tradeService.getTradeDetails(id)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async proposeTrade(req: Request<ParamsDictionary, any, ProposalReqBody>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { id } = req.params
    const payload = req.body
    const result = await tradeService.proposeTrade(id, accountId, payload)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getTradeProposals(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { postId } = req.params
    const result = await tradeService.getTradeProposals(postId, accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async getMyProposals(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await tradeService.getMyProposals(accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async createCounterOffer(req: Request<ParamsDictionary, any, ProposalReqBody>, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { proposalId } = req.params
    const payload = req.body
    const result = await tradeService.createCounterOffer(proposalId, accountId, payload)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async acceptProposal(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { proposalId } = req.params
    const result = await tradeService.acceptProposal(proposalId, accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async rejectProposal(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { proposalId } = req.params
    const result = await tradeService.rejectProposal(proposalId, accountId)
    res.status(HTTP_STATUS.OK).json(result)
  }
}

const tradeController = new TradeController()

export default tradeController