import { ErrorWithStatus } from '~/models/Errors'
import databaseServices from './database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { TRADE_MESSAGES } from '~/constants/messages'
import { ProposalReqBody, TradePostReqBody } from '~/models/requests/Trade.requests'
import { ObjectId } from 'mongodb'
import TradePosts from '~/models/schemas/TradePost.schema'
import TradeProposals from '~/models/schemas/TradeProposal.schema'
import { TradeStatus } from '~/constants/enums'

class TradeService {
  async getAllTrades() {
    const tradePosts = await databaseServices.tradePosts.find().toArray()
    if (!tradePosts || tradePosts.length === 0) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.NO_TRADES_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return {
      message: TRADE_MESSAGES.TRADE_POSTS_FETCHED,
      data: tradePosts
    }
  }

  async getMyTrades(accountId: string) {
    const userId = new ObjectId(accountId)
    const myTradePosts = await databaseServices.tradePosts
      .find({
        authorId: userId
      })
      .toArray()

    return {
      message: TRADE_MESSAGES.GET_MY_TRADES_SUCCESS,
      data: myTradePosts
    }
  }

  async createTrade(payload: TradePostReqBody, accountId: string) {
    const { description, item, title } = payload
    const tradePost = new TradePosts({
      description,
      item,
      title,
      authorId: new ObjectId(accountId)
    })

    await databaseServices.tradePosts.insertOne(tradePost)

    return {
      message: TRADE_MESSAGES.WAIT_FOR_APPROVE,
      data: tradePost
    }
  }

  async getTradeDetails(id: string) {
    const tradePost = await databaseServices.tradePosts.findOne({
      _id: new ObjectId(id)
    })

    if (!tradePost) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const author = await databaseServices.accounts.findOne({
      _id: tradePost?.authorId
    })

    if (!author) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.AUTHOR_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const item = await databaseServices.products.findOne({
      _id: tradePost.item
    })

    if (!item) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.ITEM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return {
      message: TRADE_MESSAGES.TRADE_POSTS_FETCHED,
      data: {
        tradePost,
        author,
        item
      }
    }
  }

  async proposeTrade(postId: string, accountId: string, payload: ProposalReqBody) {
    const { items, message } = payload
    const userId = new ObjectId(accountId)
    const tradePostId = new ObjectId(postId)
    const tradePost = await databaseServices.tradePosts.findOne({
      _id: tradePostId
    })

    if (!tradePost) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (tradePost.authorId.equals(userId)) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.CANNOT_PROPOSE_OWN_POST,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const item = await databaseServices.products.findOne({
      _id: tradePost.item
    })

    if (!item) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.ITEM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const tradeProposal = new TradeProposals({
      items,
      message,
      proposerId: userId,
      postId: tradePostId
    })

    await databaseServices.tradeProposals.insertOne(tradeProposal)

    return {
      message: TRADE_MESSAGES.TRADE_PROPOSAL_CREATED,
      data: tradeProposal
    }
  }

  async getTradeProposals(postId: string, accountId: string) {
    const userId = new ObjectId(accountId)
    const tradePostId = new ObjectId(postId)
    const tradePost = await databaseServices.tradePosts.findOne({
      _id: tradePostId
    })

    if (!tradePost) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!tradePost.authorId.equals(userId)) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.UNAUTHORIZED_ACCESS_TO_PROPOSALS,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const proposals = await databaseServices.tradeProposals
      .find({
        postId: tradePostId
      })
      .toArray()

    const enrichedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        const proposer = await databaseServices.accounts.findOne({
          _id: proposal.proposerId
        })

        const itemDetails = await Promise.all(
          proposal.items.map(async (itemId) => {
            return await databaseServices.products.findOne({ _id: itemId })
          })
        )

        return {
          ...proposal,
          proposer,
          itemDetails
        }
      })
    )

    return {
      message: TRADE_MESSAGES.TRADE_PROPOSAL_FETCHED,
      data: enrichedProposals
    }
  }

  async getMyProposals(accountId: string) {
    const userId = new ObjectId(accountId)

    const myProposals = await databaseServices.tradeProposals
      .find({
        proposerId: userId
      })
      .toArray()

    const enrichedProposals = await Promise.all(
      myProposals.map(async (proposal) => {
        const tradePost = await databaseServices.tradePosts.findOne({
          _id: proposal.postId
        })

        const postAuthor = await databaseServices.accounts.findOne({
          _id: tradePost?.authorId
        })

        const itemDetails = await Promise.all(
          proposal.items.map(async (itemId) => {
            return await databaseServices.products.findOne({ _id: itemId })
          })
        )

        return {
          ...proposal,
          tradePost,
          postAuthor,
          itemDetails
        }
      })
    )

    return {
      message: TRADE_MESSAGES.GET_MY_PROPOSALS_SUCCESS,
      data: enrichedProposals
    }
  }

  async createCounterOffer(proposalId: string, accountId: string, payload: ProposalReqBody) {
    const { items, message } = payload
    const userId = new ObjectId(accountId)

    const originalProposal = await databaseServices.tradeProposals.findOne({
      _id: new ObjectId(proposalId)
    })

    if (!originalProposal) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.PROPOSAL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const tradePost = await databaseServices.tradePosts.findOne({
      _id: originalProposal.postId
    })

    if (!tradePost) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isPostOwner = tradePost.authorId.equals(userId)
    const isProposer = originalProposal.proposerId.equals(userId)

    if (!isPostOwner && !isProposer) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.UNAUTHORIZED_COUNTER_OFFER,
        status: HTTP_STATUS.FORBIDDEN
      })
    }


    if (originalProposal.parentProposalId) {
      // const parentProposal = await databaseServices.tradeProposals.findOne({
      //   _id: originalProposal.parentProposalId
      // })

      // If the original proposal was made by the post owner and current user is not the proposer, reject
      if (originalProposal.proposerId.equals(tradePost.authorId) && !isProposer) {
        throw new ErrorWithStatus({
          message: TRADE_MESSAGES.UNAUTHORIZED_COUNTER_OFFER,
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      if (!originalProposal.proposerId.equals(tradePost.authorId) && !isPostOwner) {
        throw new ErrorWithStatus({
          message: TRADE_MESSAGES.UNAUTHORIZED_COUNTER_OFFER,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
    }

    await databaseServices.tradeProposals.updateOne(
      { _id: originalProposal._id },
      {
        $set: {
          status: TradeStatus.Countered,
          updatedAt: new Date()
        }
      }
    )

    const counterProposal = new TradeProposals({
      items,
      message,
      proposerId: userId,
      postId: tradePost._id,
      parentProposalId: originalProposal._id,
      isCounterOffer: true
    })

    await databaseServices.tradeProposals.insertOne(counterProposal)

    return {
      message: TRADE_MESSAGES.COUNTER_OFFER_CREATED,
      data: counterProposal
    }
  }

  async acceptProposal(proposalId: string, accountId: string) {
    const userId = new ObjectId(accountId)

    // Find the proposal
    const proposal = await databaseServices.tradeProposals.findOne({
      _id: new ObjectId(proposalId)
    })

    if (!proposal) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.PROPOSAL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Find the trade post
    const tradePost = await databaseServices.tradePosts.findOne({
      _id: proposal.postId
    })

    if (!tradePost) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Only the post owner can accept a proposal
    if (!tradePost.authorId.equals(userId)) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.UNAUTHORIZED_ACTION,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Update proposal status to accepted
    await databaseServices.tradeProposals.updateOne(
      { _id: proposal._id },
      {
        $set: {
          status: TradeStatus.Accepted,
          updatedAt: new Date()
        }
      }
    )

    // Reject all other proposals for this post
    await databaseServices.tradeProposals.updateMany(
      {
        postId: tradePost._id,
        _id: { $ne: proposal._id },
        status: { $nin: [TradeStatus.Rejected, TradeStatus.Accepted] }
      },
      {
        $set: {
          status: TradeStatus.Rejected,
          updatedAt: new Date()
        }
      }
    )

    // Mark the trade post as completed
    await databaseServices.tradePosts.updateOne(
      { _id: tradePost._id },
      {
        $set: {
          status: TradeStatus.Completed,
          completedProposalId: proposal._id,
          updatedAt: new Date()
        }
      }
    )

    return {
      message: TRADE_MESSAGES.PROPOSAL_ACCEPTED,
      data: proposal
    }
  }

  async rejectProposal(proposalId: string, accountId: string) {
    const userId = new ObjectId(accountId)

    const proposal = await databaseServices.tradeProposals.findOne({
      _id: new ObjectId(proposalId)
    })

    if (!proposal) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.PROPOSAL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const tradePost = await databaseServices.tradePosts.findOne({
      _id: proposal.postId
    })

    if (!tradePost) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isPostOwner = tradePost.authorId.equals(userId)
    const isProposer = proposal.proposerId.equals(userId)

    if (!isPostOwner && !isProposer) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.UNAUTHORIZED_ACTION,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    await databaseServices.tradeProposals.updateOne(
      { _id: proposal._id },
      {
        $set: {
          status: TradeStatus.Rejected,
          updatedAt: new Date()
        }
      }
    )

    if (proposal.parentProposalId) {
      const relatedProposals = await this.findAllRelatedProposals(proposal.parentProposalId)

      for (const relatedProposal of relatedProposals) {
        if (relatedProposal.createdAt > proposal.createdAt) {
          await databaseServices.tradeProposals.updateOne(
            { _id: relatedProposal._id },
            {
              $set: {
                status: TradeStatus.Rejected,
                updatedAt: new Date()
              }
            }
          )
        }
      }
    }

    return {
      message: TRADE_MESSAGES.PROPOSAL_REJECTED,
      data: proposal
    }
  }


  private async findAllRelatedProposals(rootProposalId: ObjectId): Promise<TradeProposals[]> {
    const result = []
    const rootProposal = await databaseServices.tradeProposals.findOne({
      _id: rootProposalId
    })

    if (rootProposal) {
      result.push(rootProposal)

      const counterOffers = await databaseServices.tradeProposals
        .find({
          parentProposalId: rootProposalId
        })
        .toArray()

      for (const counterOffer of counterOffers) {
        const nestedCounterOffers = await this.findAllRelatedProposals(counterOffer._id)
        result.push(...nestedCounterOffers)
      }
    }

    return result
  }
}

const tradeService = new TradeService()
export default tradeService
