import { Router } from 'express'
import feedbackController from '~/controllers/Feedback.controllers'
import { accessTokenValidation } from '~/middlewares/accounts.middlewares'
import { userOrderedValidation, validateCreateFeedback } from '~/middlewares/products.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { CreateFeedbackReqBody } from '~/models/requests/Feedback.requests'

const feedbackRouter = Router()

// Create feedback
feedbackRouter.post(
  '/',
  accessTokenValidation,
  validateCreateFeedback,
  userOrderedValidation,
  filterMiddleware<CreateFeedbackReqBody>(['content', 'accountId', 'productId', 'rate']),
  wrapRequestHandler(feedbackController.createFeedback)
)

// Get feedbacks by product ID
feedbackRouter.get('/:productId', accessTokenValidation, wrapRequestHandler(feedbackController.getFeedbacksByProductId))

// Update feedback
feedbackRouter.put('/:feedbackId', accessTokenValidation, wrapRequestHandler(feedbackController.updateFeedback))

// Delete feedback
feedbackRouter.delete('/:feedbackId', accessTokenValidation, wrapRequestHandler(feedbackController.deleteFeedback))

export default feedbackRouter
