import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { PaymentStatus, OrderStatus } from '~/constants/enums'
import Transactions from '~/models/schemas/Transaction.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDER_MESSAGES, PAYMENT_MESSAGES, USER_MESSAGES } from '~/constants/messages'

class PaymentService {
  async processWebhook(payload: any) {
    const { gateway, transactionDate, transferAmount, content, referenceCode } = payload

    // Extract information from the content field
    const contentInfo = this.parseContentInfo(content)
    const { type, id } = contentInfo

    if (type === 'order') {
      return await this.processOrderPayment(id, {
        gateway,
        transactionDate: new Date(transactionDate),
        transferAmount,
        content,
        referenceCode
      })
    } else if (type === 'topup') {
      return await this.processCreditTopup(id, {
        gateway,
        transactionDate: new Date(transactionDate),
        transferAmount,
        content,
        referenceCode
      })
    } else {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PAYMENT_MESSAGES.INVALID_PAYMENT_GATEWAY
      })
    }
  }

  private parseContentInfo(content: string) {
    // Expected content format: "orderId 123456 GD ..." or "topupId 123456 GD ..."
    const orderMatch = content.match(/orderId\s+([a-zA-Z0-9]+)/i)
    const topupMatch = content.match(/topupId\s+([a-zA-Z0-9]+)/i)

    if (orderMatch && orderMatch[1]) {
      return { type: 'order', id: orderMatch[1] }
    } else if (topupMatch && topupMatch[1]) {
      return { type: 'topup', id: topupMatch[1] }
    }

    return { type: null, id: null }
  }

  private async processOrderPayment(
    orderId: string | null,
    paymentInfo: {
      gateway: string
      transactionDate: Date
      transferAmount: number
      content: string
      referenceCode: string
    }
  ) {
    if (!orderId || !ObjectId.isValid(orderId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.ORDER_NOT_FOUND
      })
    }

    const order = await databaseServices.orders.findOne({
      _id: new ObjectId(orderId)
    })

    if (!order) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: ORDER_MESSAGES.ORDER_NOT_FOUND
      })
    }

    const { gateway, transactionDate, transferAmount, content } = paymentInfo

    const transaction = new Transactions({
      accountId: order.buyerInfo.accountId,
      transferAmount,
      status: PaymentStatus.Success,
      transactionDate,
      gateway,
      content
    })

    await databaseServices.transactions.insertOne(transaction)

    // Update order status to confirmed
    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Confirmed,
          updatedAt: new Date()
        }
      }
    )

    return {
      message: PAYMENT_MESSAGES.PAYMENT_PROCESSED_SUCCESS,
      orderId: order._id,
      transactionId: transaction._id
    }
  }

  private async processCreditTopup(
    accountId: string | null,
    paymentInfo: {
      gateway: string
      transactionDate: Date
      transferAmount: number
      content: string
      referenceCode: string
    }
  ) {
    if (!accountId || !ObjectId.isValid(accountId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: USER_MESSAGES.USER_NOT_FOUND
      })
    }

    const account = await databaseServices.accounts.findOne({
      _id: new ObjectId(accountId)
    })

    if (!account) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USER_MESSAGES.USER_NOT_FOUND
      })
    }

    const { gateway, transactionDate, transferAmount, content } = paymentInfo

    // Create transaction record
    const transaction = new Transactions({
      accountId: new ObjectId(accountId),
      transferAmount,
      status: PaymentStatus.Success,
      transactionDate,
      gateway,
      content
    })

    await databaseServices.transactions.insertOne(transaction)

    // Get credit conversion rate
    const creditConversion = await databaseServices.creditConversion.find().next()

    if (!creditConversion) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: PAYMENT_MESSAGES.CREDIT_CONVERSION_NOT_FOUND
      })
    }

    // Calculate credits to add based on conversion rate
    const creditsToAdd = Math.floor(transferAmount / creditConversion.rate)

    // Update user's remaining credits
    await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $inc: { remainingCredits: creditsToAdd } }
    )

    return {
      message: PAYMENT_MESSAGES.TOP_UP_INSTRUCTION_GENRATED,
      accountId,
      transactionId: transaction._id,
      creditsAdded: creditsToAdd
    }
  }
}

const paymentService = new PaymentService()
export default paymentService
