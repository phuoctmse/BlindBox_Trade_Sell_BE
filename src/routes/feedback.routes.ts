import { Router } from "express";
import { createFeedbackController, getFeedbacksByProductIdController, updateFeedbackController } from "~/controllers/Feedback.controllers";
import { accessTokenValidation } from "~/middlewares/accounts.middlewares";
import { userOrderedValidation, validateCreateFeedback } from "~/middlewares/products.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const feedbackRouter = Router();

feedbackRouter.post('/', accessTokenValidation,validateCreateFeedback ,userOrderedValidation, wrapRequestHandler(createFeedbackController));

feedbackRouter.get('/:productId', accessTokenValidation, wrapRequestHandler(getFeedbacksByProductIdController))
feedbackRouter.put('/:feedbackId', accessTokenValidation, wrapRequestHandler(updateFeedbackController))

export default feedbackRouter;