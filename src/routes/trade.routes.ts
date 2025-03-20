import { Router } from 'express'
import {
  acceptProposalController,
  counterOfferController,
  createTradeController,
  getAllTradesController,
  getMyProposalsController,
  getMyTradesController,
  getTradeDetailsController,
  getTradeProposalsController,
  proposeTradeController,
  rejectProposalController
} from '~/controllers/trade.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { validationAuthorInfo, validationProposal, validationTradePost } from '~/middlewares/trade.middlewares'
import { ProposalReqBody, TradePostReqBody } from '~/models/requests/Trade.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const tradesRouter = Router()

// Trade Posts
tradesRouter.get('/', accessTokenValidation, wrapRequestHandler(getAllTradesController))
tradesRouter.get('/my-trades', accessTokenValidation, wrapRequestHandler(getMyTradesController))
tradesRouter.get('/:id', accessTokenValidation, wrapRequestHandler(getTradeDetailsController))
tradesRouter.post(
  '/',
  accessTokenValidation,
  validationAuthorInfo,
  validationTradePost,
  filterMiddleware<TradePostReqBody>(['title', 'item', 'description']),
  wrapRequestHandler(createTradeController)
)

// Trade Proposals
tradesRouter.post(
  '/:id/propose',
  accessTokenValidation,
  validationProposal,
  filterMiddleware<ProposalReqBody>(['items', 'message']),
  wrapRequestHandler(proposeTradeController)
)
tradesRouter.get('/posts/:postId/proposals', accessTokenValidation, wrapRequestHandler(getTradeProposalsController))
tradesRouter.get('/proposals/me', accessTokenValidation, wrapRequestHandler(getMyProposalsController))

// Counter-offers and Proposal Actions
tradesRouter.post(
  '/proposals/:proposalId/counter',
  accessTokenValidation,
  validationProposal,
  filterMiddleware<ProposalReqBody>(['items', 'message']),
  wrapRequestHandler(counterOfferController)
)
tradesRouter.patch('/proposals/:proposalId/accept', accessTokenValidation, wrapRequestHandler(acceptProposalController))
tradesRouter.patch('/proposals/:proposalId/reject', accessTokenValidation, wrapRequestHandler(rejectProposalController))

export default tradesRouter
