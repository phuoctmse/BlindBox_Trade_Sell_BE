import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { Category } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import databaseServices from '~/services/database.services'
import { validate } from '~/utils/validation'

export const validationAuthorInfo = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId } = req.decode_authorization as TokenPayload
  if (!ObjectId.isValid(accountId)) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Invalid account id'
    })
  }
  next()
}

export const validationTradePost = validate(
  checkSchema({
    item: {
      custom: {
        options: async (value: string) => {
          if (!ObjectId.isValid(value)) {
            throw new Error(PRODUCT_MESSAGES.INVALID_PRODUCT_ID)
          }

          const openedItems = await databaseServices.products.findOne({
            _id: new ObjectId(value),
            category: Category.OpenedItems
          })
          if (!openedItems) {
            throw new Error(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND)
          }
          return true
        }
      }
    },
    title: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 3, max: 100 }
      }
    },
    description: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 5, max: 500 }
      }
    }
  })
)

export const validationProposal = validate(
  checkSchema({
    items: {
      isArray: true,
      custom: {
        options: async (value: string[]) => {
          for (const item of value) {
            if (!ObjectId.isValid(item)) {
              throw new Error(PRODUCT_MESSAGES.INVALID_PRODUCT_ID)
            }

            const openedItems = await databaseServices.products.findOne({
              _id: new ObjectId(item),
              category: Category.OpenedItems
            })
            if (!openedItems) {
              throw new Error(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND)
            }
          }
          return true
        }
      }
    },
    message: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 5, max: 500 }
      }
    }
  })
)
