import { Router } from 'express'
import {
  createFeedbackController,
  deleteFeedbackController,
  getFeedbacksByProductIdController,
  updateFeedbackController
} from '../controllers/Feedback.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { userOrderedValidation, validateCreateFeedback } from '~/middlewares/products.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { CreateFeedbackReqBody } from '~/models/requests/Feedback.requests'

const feedbackRouter = Router()
//request productId, rate, content
feedbackRouter.post(
  '/',
  accessTokenValidation,
  validateCreateFeedback,
  userOrderedValidation,
  filterMiddleware<CreateFeedbackReqBody>(['content', 'accountId', 'productId', 'rate']),
  wrapRequestHandler(createFeedbackController)
)

feedbackRouter.get('/:productId', accessTokenValidation, wrapRequestHandler(getFeedbacksByProductIdController))
feedbackRouter.put('/:feedbackId', accessTokenValidation, wrapRequestHandler(updateFeedbackController))
feedbackRouter.delete('/:feedbackId', accessTokenValidation, wrapRequestHandler(deleteFeedbackController))
export default feedbackRouter
