import { Router } from "express";
import { createFeedbackController, getFeedbacksByProductIdController, updateFeedbackController } from "~/controllers/Feedback.controllers";
import { accessTokenValidation } from "~/middlewares/accounts.middlewares";
import { validateCreateFeedback } from "~/middlewares/products.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const feedbackRouter = Router();

feedbackRouter.post('/', accessTokenValidation,validateCreateFeedback ,wrapRequestHandler(createFeedbackController));

feedbackRouter.get('/:productId', accessTokenValidation, wrapRequestHandler(getFeedbacksByProductIdController))
feedbackRouter.put('/:feedbackId', accessTokenValidation,validateCreateFeedback, wrapRequestHandler(updateFeedbackController))

export default feedbackRouter;