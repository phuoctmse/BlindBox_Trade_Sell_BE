import { CreateFeedbackReqBody } from "~/models/requests/Feedback.requests";
import databaseServices from "./database.services";
import { ObjectId } from "mongodb";
import { FEEDBACK_MESSAGES } from "~/constants/messages";
import Feedbacks from "~/models/schemas/Feedback.schema";

class FeedbackService {
  async createFeedback(payload: CreateFeedbackReqBody, accountId: string) {
    // Check if feedback already exists for this product and account
    const existingFeedback = await databaseServices.feedbacks.findOne({
      accountId: new ObjectId(accountId),
      productId: new ObjectId(payload.productId)
    });

    if (existingFeedback) {
      throw new Error(FEEDBACK_MESSAGES.ALREADY_LEFT_FEEDBACK);
    }

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
    const existingFeedback = await databaseServices.feedbacks.findOne({
      _id: new ObjectId(feedbackId)
    });
    if (!existingFeedback) {
      throw new Error(FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND);
    }
    const updateFields: Partial<CreateFeedbackReqBody> & { updatedAt?: Date } = {};
    if (payload.rate !== undefined) {
      updateFields.rate = payload.rate;
    }
    if (payload.content !== undefined) {
      updateFields.content = payload.content;
    }
    const result = await databaseServices.feedbacks.updateOne(
      { _id: new ObjectId(feedbackId) },
      { $set: updateFields }
    );

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_UPDATED_SUCCESS,
      result
    };
  }

  async deleteFeedback(feedbackId: string) {
    const feedback = await databaseServices.feedbacks.findOne({
      _id: new ObjectId(feedbackId)
    });
    if (!feedback) {
      throw new Error(FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND);
    }
    const result = await databaseServices.feedbacks.deleteOne({
      _id: new ObjectId(feedbackId)
    });
    await databaseServices.products.updateOne(
      { _id: feedback.productId },
      { $pull: { feedBack: new ObjectId(feedbackId) } }
    );

    return {
      message: FEEDBACK_MESSAGES.FEEDBACK_DELETED_SUCCESS,
      result
    };
  }
}

export default new FeedbackService();