import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import productService from '~/services/product.services'
import { validate } from '~/utils/validation'

export const addToCartValidation = validate(
  checkSchema(
    {
      productId: {
        notEmpty: true,
        isString: true
      },
      quantity: {
        notEmpty: true,
        isInt: {
          options: {
            min: 1
          },
          errorMessage: CART_MESSAGES.QUANTITY_MUST_BE_A_POSITIVE_INTEGER
        },
        toInt: true
      }
    },
    ['body']
  )
)
