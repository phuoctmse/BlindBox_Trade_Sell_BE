import { CreateFeedbackReqBody } from "~/models/requests/Feedback.requests";
import databaseServices from "./database.services";
import { ObjectId } from "mongodb";
import { FEEDBACK_MESSAGES } from "~/constants/messages";
import Feedbacks from "~/models/schemas/Feedback.schema";

class FeedbackService {
  async createFeedback(payload: CreateFeedbackReqBody, accountId: string) {
    const newFeedbackId = new ObjectId();
    const feedback = new Feedbacks({
      _id: newFeedbackId,
      accountId: new ObjectId(accountId),
      productId: new ObjectId(payload.productId),
      rate: payload.rate,
      content: payload.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await databaseServices.feedbacks.insertOne(feedback);

    await databaseServices.products.updateOne(
      { _id: feedback.productId },
      { $push: { feedBack: feedback._id } }
    );

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_CREATED_SUCCESS
    };
  }

  async getFeedbacksByProductId(productId: string) {
    const result = await databaseServices.feedbacks
      .find({ productId: new ObjectId(productId) })
      .toArray();

    const formattedResult = result.map((feedback) => ({
      ...feedback,
      _id: feedback._id.toString(),
      accountId: feedback.accountId.toString(),
      productId: feedback.productId.toString(),
    }));

    return {
      message: FEEDBACK_MESSAGES.FEEDBACKS_FETCHED_SUCCESS,
      formattedResult
    }
  }

  async updateFeedback(feedbackId: string, payload: CreateFeedbackReqBody) {
    const feedback = new Feedbacks({
      _id: new ObjectId(feedbackId),
      accountId: new ObjectId(payload.accountId),
      productId: new ObjectId(payload.productId),
      rate: payload.rate,
      content: payload.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await databaseServices.feedbacks.updateOne(
      { _id: feedback._id },
      { $set: feedback }
    );

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_UPDATED_SUCCESS
    }
  }
}

export default new FeedbackService();