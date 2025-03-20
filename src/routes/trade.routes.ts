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
import { validationAuthorInfo, validationProposal, validationTradePost } from '~/middlewares/trade.middlewares'
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
  wrapRequestHandler(createTradeController)
)

// Trade Proposals
tradesRouter.post('/:id/propose', accessTokenValidation, validationProposal, wrapRequestHandler(proposeTradeController))
tradesRouter.get('/posts/:postId/proposals', accessTokenValidation, wrapRequestHandler(getTradeProposalsController))
tradesRouter.get('/proposals/me', accessTokenValidation, wrapRequestHandler(getMyProposalsController))

// Counter-offers and Proposal Actions
tradesRouter.post(
  '/proposals/:proposalId/counter',
  accessTokenValidation,
  validationProposal,
  wrapRequestHandler(counterOfferController)
)
tradesRouter.patch('/proposals/:proposalId/accept', accessTokenValidation, wrapRequestHandler(acceptProposalController))
tradesRouter.patch('/proposals/:proposalId/reject', accessTokenValidation, wrapRequestHandler(rejectProposalController))

export default tradesRouter
