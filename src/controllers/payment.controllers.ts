import { Request, Response } from 'express'
import paymentService from '~/services/payment.services'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseServices from '~/services/database.services'
import { TokenPayload } from '~/models/requests/Account.requests'
import { config } from 'dotenv'
import { PAYMENT_MESSAGES } from '~/constants/messages'
config()

class PaymentController {
  async getWebHook(req: Request, res: Response) {
    const data = req.body
    console.log('Received webhook data:', data)

    const result = await paymentService.processWebhook(data)

    res.status(HTTP_STATUS.OK).json({
      message: PAYMENT_MESSAGES.PAYMENT_PROCESSED_SUCCESS,
      result
    })
  }

  async createOrderPaymentLink(req: Request, res: Response) {
    const { orderId } = req.params
    const { accountId } = req.decode_authorization as TokenPayload

    const paymentContent = `orderId ${orderId} GD ${Date.now()}`

    res.status(HTTP_STATUS.OK).json({
      message: PAYMENT_MESSAGES.PAYMENT_INSTRUCTION_GENERATED,
      result: {
        accountNumber: process.env.ACCOUNT_NUMBER as string,
        bankName: process.env.BANK_NAME as string,
        content: paymentContent
      }
    })
  }

  async createCreditTopupLink(req: Request, res: Response) {
    const { accountId } = req.decode_authorization as TokenPayload
    const { amount } = req.body

    const paymentContent = `topupId ${accountId} GD ${Date.now()}`

    const creditConversionCursor = databaseServices.creditConversion.find({})
    const creditConversion = await creditConversionCursor.next()

    if (!creditConversion) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: PAYMENT_MESSAGES.CREDIT_CONVERSION_NOT_FOUND
      })
      return
    }

    const creditsToReceive = Math.floor(Number(amount) / creditConversion.rate)

    res.status(HTTP_STATUS.OK).json({
      message: PAYMENT_MESSAGES.TOP_UP_INSTRUCTION_GENRATED,
      result: {
        accountNumber: process.env.ACCOUNT_NUMBER as string,
        bankName: process.env.BANK_NAME as string,
        content: paymentContent,
        amount: Number(amount),
        creditsToReceive,
        conversionRate: creditConversion.rate
      }
    })
  }
}

const paymentController = new PaymentController()

export default paymentController
