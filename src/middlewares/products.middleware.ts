import { checkSchema, ParamSchema } from 'express-validator'
import { PRODUCT_MESSAGES } from '~/constants/messages'
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
  isNumeric: true,
  isInt: {
    options: { min: 1 },
    errorMessage: PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_POSITIVE_INTEGER
  }
}

const priceSchema: ParamSchema = {
  notEmpty: true,
  isNumeric: true,
  isFloat: {
    options: { min: 0 },
    errorMessage: PRODUCT_MESSAGES.PRICE_MUST_BE_A_POSITIVE_NUMBER
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
  isNumeric: true,
  isInt: {
    options: { min: 1 },
    errorMessage: PRODUCT_MESSAGES.SIZE_MUST_BE_POSITIVE_NUMBER
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
    image: imageSchema,
  })
)
