import { match } from 'assert'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { forEach } from 'lodash'
import { ObjectId } from 'mongodb'
import { Category, OrderStatus, OrderType, PaymentMethod } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDER_MESSAGES, PRODUCT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import databaseServices from '~/services/database.services'
import { validate } from '~/utils/validation'

export const validateReceiverInfo = (req: Request, res: Response, next: NextFunction) => {
  const { receiverInfo } = req.body

  if (!receiverInfo) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.RECEIVER_INFO_REQUIRED
      })
    )
  }

  const { fullName, phoneNumber, address } = receiverInfo
  if (!fullName || !phoneNumber || !address) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.INCOMPLETE_RECEIVER_INFO
      })
    )
  }

  next()
}

const createDirectOrderValidation = validate(
  checkSchema(
    {
      orderType: {
        isIn: {
          options: [[OrderType.Direct]],
          errorMessage: ORDER_MESSAGES.INVALID_ORDER_TYPE
        }
      },
      'item.productId': {
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.PRODUCT_ID_REQUIRED
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(PRODUCT_MESSAGES.INVALID_PRODUCT_ID)
            }

            const product = await databaseServices.products.findOne({
              _id: ObjectId.createFromHexString(value)
            })

            if (!product) {
              throw new Error(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND)
            }

            return true
          }
        }
      },
      'item.quantity': {
        notEmpty: true,
        isInt: {
          options: { min: 1 },
          errorMessage: PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_POSITIVE_INTEGER
        },
        custom: {
          options: async (value, { req }) => {
            const productId = req.body.item?.productId

            if (!productId || !ObjectId.isValid(productId)) {
              return true // Đã được kiểm tra ở trên
            }

            const product = await databaseServices.products.findOne({
              _id: ObjectId.createFromHexString(productId)
            })

            if (!product) {
              return true // Đã được kiểm tra ở trên
            }

            if (product.quantity < value) {
              throw new Error(PRODUCT_MESSAGES.INSUFFICIENT_STOCK)
            }

            return true
          }
        }
      },
      paymentMethod: {
        isIn: {
          options: [[PaymentMethod.COD, PaymentMethod.Banking]],
          errorMessage: 'Invalid payment method'
        }
      },
      promotionId: {
        optional: true,
        custom: {
          options: async (value) => {
            if (!value) return true

            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid promotion ID')
            }

            const promotion = await databaseServices.promotions.findOne({
              _id: ObjectId.createFromHexString(value)
            })

            if (!promotion) {
              throw new Error('Promotion not found')
            }

            const now = new Date()
            if (now < promotion.startDate || now > promotion.endDate) {
              throw new Error('Promotion has expired or not yet started')
            }

            if (!promotion.isActive) {
              throw new Error('Promotion is inactive')
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

const createCartOrderValidation = validate(
  checkSchema(
    {
      orderType: {
        isIn: {
          options: [[OrderType.Cart]],
          errorMessage: ORDER_MESSAGES.INVALID_ORDER_TYPE
        }
      },
      items: {
        isArray: {
          options: { min: 1 },
          errorMessage: 'Items are required and must be an array'
        },
        custom: {
          options: async (value, { req }) => {
            const { accountId } = req.decode_authorization
            const cart = await databaseServices.carts.findOne({
              accountId: ObjectId.createFromHexString(accountId)
            })

            if (!cart) {
              throw new Error('Cart not found')
            }

            for (let i = 0; i < value.length; i++) {
              const item = value[i]

              if (!item.itemId || !ObjectId.isValid(item.itemId)) {
                throw new Error(`Item at index ${i} has invalid ID`)
              }

              const cartItem = await databaseServices.cartItems.findOne({
                _id: ObjectId.createFromHexString(item.itemId),
                cartId: cart._id
              })

              if (!cartItem) {
                throw new Error(`Item at index ${i} not found in your cart`)
              }

              if (item.quantity !== undefined) {
                if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                  throw new Error(`Quantity for item at index ${i} must be a positive integer`)
                }

                if (item.quantity !== cartItem.quantity) {
                  throw new Error(
                    `Quantity for item at index ${i} must match with cart item quantity (${cartItem.quantity})`
                  )
                }
                const product = await databaseServices.products.findOne({
                  _id: cartItem.productId
                })

                if (!product) {
                  throw new Error(`Product for item at index ${i} no longer exists`)
                }

                if (product.quantity < item.quantity) {
                  throw new Error(
                    `${product.name} ${PRODUCT_MESSAGES.INSUFFICIENT_STOCK} (only ${product.quantity} available)`
                  )
                }
              }
            }
            return true
          }
        }
      },

      paymentMethod: {
        isIn: {
          options: [[PaymentMethod.COD, PaymentMethod.Banking]],
          errorMessage: 'Invalid payment method'
        }
      },
      promotionId: {
        optional: true,
        custom: {
          options: async (value) => {
            if (!value) return true

            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid promotion ID')
            }

            const promotion = await databaseServices.promotions.findOne({
              _id: ObjectId.createFromHexString(value)
            })

            if (!promotion) {
              throw new Error('Promotion not found')
            }

            const now = new Date()
            if (now < promotion.startDate || now > promotion.endDate) {
              throw new Error('Promotion has expired or not yet started')
            }

            if (!promotion.isActive) {
              throw new Error('Promotion is inactive')
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const createOrderValidation = (req: Request, res: Response, next: NextFunction) => {
  const { orderType } = req.body

  if (orderType === OrderType.Direct) {
    return createDirectOrderValidation(req, res, next)
  } else if (orderType === OrderType.Cart) {
    return createCartOrderValidation(req, res, next)
  } else {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.INVALID_ORDER_TYPE
      })
    )
  }
}

export const validateCancelOrder = validate(
  checkSchema({
    orderId: {
      in: 'params',
      isString: true,
      notEmpty: {
        errorMessage: 'Order ID is required'
      },
      custom: {
        options: (value) => {
          if (!ObjectId.isValid(value)) {
            throw new Error('Invalid Order ID format')
          }
          return true
        }
      }
    },
    reason: {
      in: 'body',
      isString: true,
      trim: true,
      isLength: {
        options: { min: 5, max: 255 }
      }
    }
  })
)

export const validateSellerNotBuyingOwnProducts = async (req: Request, res: Response, next: NextFunction) => {
  const { orderType } = req.body
  const { accountId } = req.decode_authorization as TokenPayload

  if (orderType === OrderType.Direct) {
    const { productId } = req.body.item

    if (!productId || !ObjectId.isValid(productId)) {
      return next()
    }

    const product = await databaseServices.products.findOne({
      _id: ObjectId.createFromHexString(productId)
    })

    if (!product) {
      return next()
    }

    if (product.createdBy && product.createdBy.toString() === accountId) {
      return next(
        new ErrorWithStatus({
          status: HTTP_STATUS.FORBIDDEN,
          message: ORDER_MESSAGES.CANNOT_BUY_OWN_PRODUCT
        })
      )
    }
  } else if (orderType === OrderType.Cart) {
    const { items } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return next()
    }

    const cart = await databaseServices.carts.findOne({
      accountId: new ObjectId(accountId)
    })

    if (!cart) {
      return next()
    }

    for (const item of items) {
      if (!item.itemId || !ObjectId.isValid(item.itemId)) {
        continue
      }

      const cartItem = await databaseServices.cartItems.findOne({
        _id: ObjectId.createFromHexString(item.itemId),
        cartId: cart._id
      })

      if (!cartItem) {
        continue
      }

      const product = await databaseServices.products.findOne({
        _id: cartItem.productId
      })

      if (!product) {
        continue
      }

      if (product.createdBy.toString() === accountId && product.category !== Category.Accessory) {
        return next(
          new ErrorWithStatus({
            status: HTTP_STATUS.FORBIDDEN,
            message: ORDER_MESSAGES.SELLER_PRODUCT_IN_CART
          })
        )
      }
    }
  } else {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: ORDER_MESSAGES.INVALID_ORDER_TYPE
      })
    )
  }
  next()
}

export const validateChangeOrderStatus = validate(
  checkSchema(
    {
      orderId: {
        isString: true,
        notEmpty: {
          errorMessage: 'Order ID is required'
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid Order ID format')
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const validateCompleteOrder = validate(
  checkSchema(
    {
      orderId: {
        isString: true,
        notEmpty: {
          errorMessage: 'Order ID is required'
        },
        custom: {
          options: async (value, { req }) => {
            try {
              if (!ObjectId.isValid(value)) {
                throw new Error('Invalid Order ID format')
              }

              const { accountId } = req.decode_authorization as TokenPayload

              const order = await databaseServices.orders.findOne({
                _id: ObjectId.createFromHexString(value),
                'buyerInfo.accountId': new ObjectId(accountId)
              })

              if (!order) {
                throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND)
              }

              if (order.status !== OrderStatus.Processing) {
                throw new Error(ORDER_MESSAGES.CANNOT_COMPLETE_ORDER)
              }

              return true
            } catch (error) {
              console.error('Error in validateCompleteOrder:', error)
              throw error
            }
          }
        }
      }
    },
    ['params']
  )
)
