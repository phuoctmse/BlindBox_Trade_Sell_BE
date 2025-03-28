import { CreateFeedbackReqBody } from '~/models/requests/Feedback.requests'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'
import { FEEDBACK_MESSAGES } from '~/constants/messages'
import Feedbacks from '~/models/schemas/Feedback.schema'

class FeedbackService {
  async createFeedback(payload: CreateFeedbackReqBody, accountId: string) {
    const existingFeedback = await databaseServices.feedbacks.findOne({
      accountId: new ObjectId(accountId),
      productId: new ObjectId(payload.productId)
    })

    if (existingFeedback) {
      throw new Error(FEEDBACK_MESSAGES.ALREADY_LEFT_FEEDBACK)
    }

    const account = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })
    if (!account) {
      throw new Error(FEEDBACK_MESSAGES.ACCOUNT_NOT_FOUND)
    }

    const newFeedbackId = new ObjectId()
    const feedback = new Feedbacks({
      _id: newFeedbackId,
      accountId: new ObjectId(accountId),
      productId: new ObjectId(payload.productId),
      rate: payload.rate,
      content: payload.content,
      accountName: account.userName,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const result = await databaseServices.feedbacks.insertOne(feedback)

    await databaseServices.products.updateOne({ _id: feedback.productId }, { $push: { feedBack: feedback._id } })

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_CREATED_SUCCESS
    }
  }

  async getFeedbacksByProductId(productId: string) {
    const result = await databaseServices.feedbacks.find({ productId: new ObjectId(productId) }).toArray()

    const accountIds = [...new Set(result.map((feedback) => feedback.accountId))]

    const accounts = await databaseServices.accounts
      .find(
        {
          _id: { $in: accountIds }
        },
        {
          projection: { _id: 1, userName: 1, fullName: 1 }
        }
      )
      .toArray()

    const accountMap = new Map()
    accounts.forEach((account) => {
      accountMap.set(account._id.toString(), account)
    })

    const formattedResult = result.map((feedback) => {
      const accountIdString = feedback.accountId.toString()
      const account = accountMap.get(accountIdString)

      return {
        ...feedback,
        _id: feedback._id.toString(),
        accountId: accountIdString,
        productId: feedback.productId.toString(),
        account: {
          userName: account?.userName || 'Unknown user',
          fullName: account?.fullName || '',
          avatar: account?.avatar || ''
        }
      }
    })

    return {
      message: FEEDBACK_MESSAGES.FEEDBACKS_FETCHED_SUCCESS,
      result: formattedResult
    }
  }

  async updateFeedback(feedbackId: string, payload: CreateFeedbackReqBody) {
    const existingFeedback = await databaseServices.feedbacks.findOne({
      _id: new ObjectId(feedbackId)
    })
    if (!existingFeedback) {
      throw new Error(FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND)
    }
    const updateFields: Partial<CreateFeedbackReqBody> & { updatedAt?: Date } = {}
    if (payload.rate !== undefined) {
      updateFields.rate = payload.rate
    }
    if (payload.content !== undefined) {
      updateFields.content = payload.content
    }
    const result = await databaseServices.feedbacks.updateOne({ _id: new ObjectId(feedbackId) }, { $set: updateFields })

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_UPDATED_SUCCESS,
      result
    }
  }

  async deleteFeedback(feedbackId: string) {
    const feedback = await databaseServices.feedbacks.findOne({
      _id: new ObjectId(feedbackId)
    })
    if (!feedback) {
      throw new Error(FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND)
    }
    const result = await databaseServices.feedbacks.deleteOne({
      _id: new ObjectId(feedbackId)
    })
    await databaseServices.products.updateOne(
      { _id: feedback.productId },
      { $pull: { feedBack: new ObjectId(feedbackId) } }
    )

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_DELETED_SUCCESS,
      result
    }
  }
}

export default new FeedbackService()
