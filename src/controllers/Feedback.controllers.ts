import { ParamsDictionary } from 'express-serve-static-core'
import { CreateFeedbackReqBody } from '~/models/requests/Feedback.requests'
import { Request, Response } from 'express'
import feedbacksServices from '~/services/feedbacks.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/Account.requests'

class FeedbackController {
  async createFeedback(req: Request<ParamsDictionary, any, CreateFeedbackReqBody>, res: Response) {
    const payload = { ...req.body } as CreateFeedbackReqBody
    const { accountId } = req.decode_authorization as TokenPayload
    const result = await feedbacksServices.createFeedback(payload, accountId)
    res.status(HTTP_STATUS.CREATED).json(result)
  }

  async getFeedbacksByProductId(req: Request<ParamsDictionary, any, any>, res: Response) {
    const { productId } = req.params
    const feedbacks = await feedbacksServices.getFeedbacksByProductId(productId)
    res.status(HTTP_STATUS.OK).json(feedbacks)
  }

  async updateFeedback(req: Request<ParamsDictionary, any, CreateFeedbackReqBody>, res: Response) {
    const { feedbackId } = req.params
    const payload = { ...req.body } as CreateFeedbackReqBody
    const result = await feedbacksServices.updateFeedback(feedbackId, payload)
    res.status(HTTP_STATUS.OK).json(result)
  }

  async deleteFeedback(req: Request<ParamsDictionary, any, any>, res: Response) {
    const { feedbackId } = req.params
    const result = await feedbacksServices.deleteFeedback(feedbackId)
    res.status(HTTP_STATUS.OK).json(result)
  }
}

const feedbackController = new FeedbackController()

export default feedbackController
