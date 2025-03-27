import { Router } from 'express'
import tradeController from '~/controllers/trade.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { validationAuthorInfo, validationProposal, validationTradePost } from '~/middlewares/trade.middlewares'
import { ProposalReqBody, TradePostReqBody } from '~/models/requests/Trade.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const tradesRouter = Router()

// Trade Posts
tradesRouter.get('/', accessTokenValidation, wrapRequestHandler(tradeController.getAllTrades))
tradesRouter.get('/my-trades', accessTokenValidation, wrapRequestHandler(tradeController.getMyTrades))
tradesRouter.get('/:id', accessTokenValidation, wrapRequestHandler(tradeController.getTradeDetails))
tradesRouter.post(
  '/',
  accessTokenValidation,
  validationAuthorInfo,
  validationTradePost,
  filterMiddleware<TradePostReqBody>(['title', 'item', 'description']),
  wrapRequestHandler(tradeController.createTrade)
)

// Trade Proposals
tradesRouter.post(
  '/:id/propose',
  accessTokenValidation,
  validationProposal,
  filterMiddleware<ProposalReqBody>(['items', 'message']),
  wrapRequestHandler(tradeController.proposeTrade)
)
tradesRouter.get(
  '/posts/:postId/proposals',
  accessTokenValidation,
  wrapRequestHandler(tradeController.getTradeProposals)
)
tradesRouter.get('/proposals/me', accessTokenValidation, wrapRequestHandler(tradeController.getMyProposals))

// Counter-offers and Proposal Actions
tradesRouter.post(
  '/proposals/:proposalId/counter',
  accessTokenValidation,
  validationProposal,
  filterMiddleware<ProposalReqBody>(['items', 'message']),
  wrapRequestHandler(tradeController.createCounterOffer)
)
tradesRouter.patch(
  '/proposals/:proposalId/accept',
  accessTokenValidation,
  wrapRequestHandler(tradeController.acceptProposal)
)
tradesRouter.patch(
  '/proposals/:proposalId/reject',
  accessTokenValidation,
  wrapRequestHandler(tradeController.rejectProposal)
)

export default tradesRouter
