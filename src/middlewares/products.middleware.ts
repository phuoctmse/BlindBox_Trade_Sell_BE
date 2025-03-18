import { checkSchema, ParamSchema } from 'express-validator'
import { WithId } from 'mongodb'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import OrderDetails from '~/models/schemas/OrderDetail.schema'
import orderService from '~/services/order.services'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 10, max: 255 },
    errorMessage: PRODUCT_MESSAGES.NAME_MUST_BE_FROM_10_TO_255
  }
}

const descriptionSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 10, max: 1000 },
    errorMessage: PRODUCT_MESSAGES.DESCRIPTION_MUST_BE_FROM_10_TO_255
  }
}

const quantitySchema: ParamSchema = {
  notEmpty: true,
  custom: {
    options: (value) => {
      if (typeof value === 'string') {
        throw new Error(PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_POSITIVE_INTEGER)
      }
      if (typeof value === 'number' && value <= 0) {
        throw new Error(PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_POSITIVE_INTEGER)
      }
      return true
    }
  }
}

const priceSchema: ParamSchema = {
  notEmpty: true,
  custom: {
    options: (value) => {
      if (typeof value === 'string') {
        throw new Error(PRODUCT_MESSAGES.PRICE_MUST_BE_A_POSITIVE_NUMBER)
      }
      if (typeof value === 'number' && value <= 0) {
        throw new Error(PRODUCT_MESSAGES.PRICE_MUST_BE_A_POSITIVE_NUMBER)
      }
      return true
    }
  }
}

const brandSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: PRODUCT_MESSAGES.BRAND_MUST_BE_FROM_1_TO_100
  }
}

const sizeSchema: ParamSchema = {
  notEmpty: true,
  custom: {
    options: (value) => {
      if (typeof value === 'string') {
        throw new Error(PRODUCT_MESSAGES.SIZE_MUST_BE_POSITIVE_NUMBER)
      }
      if (typeof value === 'number' && value <= 0) {
        throw new Error(PRODUCT_MESSAGES.SIZE_MUST_BE_POSITIVE_NUMBER)
      }
      return true
    }
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: PRODUCT_MESSAGES.IMAGE_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    errorMessage: PRODUCT_MESSAGES.IMAGE_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const colorSchema: ParamSchema = {
  isString: {
    errorMessage: PRODUCT_MESSAGES.COLOR_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: PRODUCT_MESSAGES.COLOR_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const typeSchema: ParamSchema = {
  isString: {
    errorMessage: PRODUCT_MESSAGES.TYPE_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: PRODUCT_MESSAGES.TYPE_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const rateSchema: ParamSchema = {
  isNumeric: {
    errorMessage: PRODUCT_MESSAGES.RATE_MUST_BE_A_NUMBER
  },
  custom: {
    options: (value) => {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        throw new Error(PRODUCT_MESSAGES.RATE_MUST_BE_BETWEEN_1_AND_5)
      }
      return true
    }
  }
}

const contentSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 10, max: 1000 },
    errorMessage: PRODUCT_MESSAGES.CONTENT_MUST_BE_FROM_10_TO_1000
  }
}

export const createBlindBoxesValidation = validate(
  checkSchema(
    {
      image: imageSchema,
      name: nameSchema,
      description: descriptionSchema,
      quantity: quantitySchema,
      price: priceSchema,
      brand: brandSchema,
      size: sizeSchema
    },
    ['body']
  )
)

export const createBeadsValidation = validate(
  checkSchema(
    {
      color: colorSchema,
      type: typeSchema,
      price: priceSchema
    },
    ['body']
  )
)

export const validateCreateCustomization = validate(
  checkSchema({
    customItems: {
      isArray: {
        errorMessage: PRODUCT_MESSAGES.INVALID_PAYLOAD
      },
      custom: {
        options: (value) => {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error(PRODUCT_MESSAGES.INVALID_PAYLOAD)
          }

          value.forEach((item, index) => {
            if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1) {
              throw new Error(`Item ${index + 1}: ${PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_POSITIVE_INTEGER}`)
            }

            if (
              !item.color ||
              typeof item.color !== 'string' ||
              item.color.trim().length < 1 ||
              item.color.trim().length > 100
            ) {
              throw new Error(`Item ${index + 1}: ${PRODUCT_MESSAGES.COLOR_LENGTH_MUST_BE_FROM_1_TO_100}`)
            }

            if (!item.beadId || !/^[0-9a-fA-F]{24}$/.test(item.beadId)) {
              throw new Error(`Item ${index + 1}: ${PRODUCT_MESSAGES.INVALID_PAYLOAD}`)
            }
          })

          return true
        }
      }
    },
    image: imageSchema
  })
)

export const validateCreateFeedback = validate(
  checkSchema({
    rate: rateSchema,
    content: contentSchema
  })
)

//Handle validate if user have ordered the products
// export const userOrderedValidation = validate(
//   checkSchema({
//     custom: {
//       custom: {
//         options: async (value, { req }) => {
//           const { accountId } = req.decode_authorization as TokenPayload;
//           const { productId } = req.body;
//           const orders = await orderService.getOrdersByAccountId(accountId);

//           const productExistsInOrders = orders.result.some((order: { items: WithId<OrderDetails>[] }) =>
//             order.items.some(item => item.productId.toString() === productId)
//           );

//           if (!productExistsInOrders) {
//             throw new Error(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND_IN_ORDERS);
//           }

//           return true;
//         }
//       }
//     }
//   })
// );