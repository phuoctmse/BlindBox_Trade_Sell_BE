import { Double, ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CART_MESSAGES, ORDER_MESSAGES, PRODUCT_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { CartOrderReqBody, CreateOrderReqBody, DirectOrderReqBody } from '~/models/requests/Order.requests'
import Orders from '~/models/schemas/Order.schema'
import OrderDetails from '~/models/schemas/OrderDetail.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderStatus, PaymentMethod } from '~/constants/enums'
import Promotions from '~/models/schemas/Promotion.schema'

class OrderService {
  async getOrdersByAccountId(accountId: string) {
    const orders = await databaseServices.orders
      .find({
        'buyerInfo.accountId': new ObjectId(accountId)
      })
      .toArray()

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await databaseServices.orderDetails.find({ orderId: order._id }).toArray()

        const detailsWithProductInfo = await Promise.all(
          details.map(async (detail) => {
            const product = await databaseServices.products.findOne({ _id: detail.productId })
            return {
              ...detail,
              slug: product?.slug || ''
            }
          })
        )

        return {
          ...order,
          items: detailsWithProductInfo
        }
      })
    )
    return {
      message: ORDER_MESSAGES.ORDERS_FETCHED_SUCCESS,
      result: ordersWithDetails
    }
  }

  private async getUserInfo(accountId: string) {
    const user = await databaseServices.accounts.findOne({ _id: new ObjectId(accountId) })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: USER_MESSAGES.USER_NOT_FOUND
      })
    }

    return {
      fullName: user.fullName || user.userName || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
    }
  }

  private async applyPromotion(subTotal: number, promotionId?: string, accountId?: string) {
    if (!promotionId) return subTotal

    const promotion = await databaseServices.promotions.findOne({
      _id: new ObjectId(promotionId)
    })

    if (!promotion) return subTotal

    // Check if promotion is valid (date and active status)
    const now = new Date()
    if (now > promotion.endDate || now < promotion.startDate) {
      return subTotal
    }

    if (!promotion.isActive) {
      return subTotal
    }

    // Check if this is a single-use promotion assigned to a specific user
    if (promotion.singleUse && promotion.assignedTo) {
      // If no account ID provided or promotion is for different user or already used, don't apply it
      if (!accountId || promotion.assignedTo.toString() !== accountId.toString() || promotion.used) {
        return subTotal
      }

      // Mark the promotion as used if it's a single-use promotion
      await databaseServices.promotions.updateOne({ _id: promotion._id }, { $set: { used: true } })
    }

    // Calculate discount amount based on promotion type
    let discountAmount = 0

    // If we have a fixed discount amount (refund/compensation type)
    if (promotion.discountAmount && promotion.discountAmount > 0) {
      discountAmount = promotion.discountAmount
    }
    // Otherwise, calculate percentage-based discount
    else if (promotion.discountRate && promotion.discountRate > 0) {
      discountAmount = (subTotal * promotion.discountRate) / 100

      // If there's a maximum discount amount specified, cap the discount
      if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
        discountAmount = promotion.maxDiscountAmount
      }
    }

    // Calculate final price (don't go below zero)
    return Math.max(0, subTotal - discountAmount)
  }

  private async findCreatedBy(productId: string) {
    const product = await databaseServices.products.findOne({ _id: new ObjectId(productId) })
    if (!product) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      })
    }
    return product.createdBy
  }

  async createDirectOrder(accountId: string, payload: DirectOrderReqBody) {
    const { item } = payload
    const product = await databaseServices.products.findOne({
      _id: new ObjectId(item.productId)
    })

    if (!product) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      })
    }

    if (product.quantity < payload.item.quantity) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PRODUCT_MESSAGES.INSUFFICIENT_STOCK
      })
    }

    const receiverInfo = payload.receiverInfo || {
      fullName: '',
      phoneNumber: '',
      address: ''
    }

    const subTotal = Number(product.price) * payload.item.quantity
    const finalPrice = await this.applyPromotion(subTotal, payload.promotionId, accountId)

    const orderId = new ObjectId()
    const now = new Date()
    const order = new Orders({
      _id: orderId,
      totalPrice: new Double(finalPrice),
      promotionId: payload.promotionId ? new ObjectId(payload.promotionId) : undefined,
      status: OrderStatus.Pending,
      buyerInfo: {
        accountId: new ObjectId(accountId)
      },
      receiverInfo,
      paymentMethod: payload.paymentMethod,
      notes: payload.notes || '',
      createdAt: now,
      updatedAt: now
    })
    await databaseServices.orders.insertOne(order)
    const orderDetail = new OrderDetails({
      orderId: orderId,
      productName: product.name,
      productId: product._id,
      quantity: payload.item.quantity,
      price: product.price,
      image: product.image
    })

    await databaseServices.orderDetails.insertOne(orderDetail)

    await databaseServices.products.updateOne({ _id: product._id }, { $inc: { quantity: -item.quantity } })
    return {
      message: ORDER_MESSAGES.ORDER_CREATED_SUCCESS,
      result: {
        _id: orderId,
        totalPrice: finalPrice,
        status: OrderStatus.Pending,
        buyerInfo: {
          accountId: new ObjectId(accountId)
        },
        receiverInfo,
        items: [
          {
            productId: product._id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            image: product.image || ''
          }
        ],
        createdAt: now
      }
    }
  }

  async createCartOrder(accountId: string, payload: CartOrderReqBody) {
    const { items } = payload

    const cart = await databaseServices.carts.findOne({
      accountId: new ObjectId(accountId)
    })

    if (!cart) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CART_MESSAGES.CART_NOT_FOUND
      })
    }

    const receiverInfo = payload.receiverInfo || {
      fullName: '',
      phoneNumber: '',
      address: ''
    }

    const orderItems = []
    let subTotal = 0

    for (const cartItem of items) {
      const item = await databaseServices.cartItems.findOne({
        _id: new ObjectId(cartItem.itemId),
        cartId: cart._id
      })

      if (!item) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: CART_MESSAGES.CART_ITEM_NOT_FOUND
        })
      }

      const product = await databaseServices.products.findOne({
        _id: item.productId
      })

      if (!product) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
        })
      }

      if (product.quantity < item.quantity) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: `${product.name} ${PRODUCT_MESSAGES.INSUFFICIENT_STOCK}`
        })
      }

      const itemTotal = Number(product.price) * item.quantity
      subTotal += itemTotal

      orderItems.push({
        cartItemId: item._id,
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image || ''
      })
    }

    const finalPrice = await this.applyPromotion(subTotal, payload.promotionId, accountId)

    const orderId = new ObjectId()
    const now = new Date()

    const order = new Orders({
      _id: orderId,
      totalPrice: new Double(finalPrice),
      promotionId: payload.promotionId ? new ObjectId(payload.promotionId) : undefined,
      status: OrderStatus.Pending,
      buyerInfo: {
        accountId: new ObjectId(accountId)
      },
      receiverInfo,
      paymentMethod: payload.paymentMethod,
      notes: payload.notes || '',
      createdAt: now,
      updatedAt: now
    })

    await databaseServices.orders.insertOne(order)

    const orderDetailsForReturn = []

    for (const item of orderItems) {
      const orderDetail = new OrderDetails({
        orderId: orderId,
        productName: item.productName,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })

      await databaseServices.orderDetails.insertOne(orderDetail)

      orderDetailsForReturn.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })

      await databaseServices.products.updateOne({ _id: item.productId }, { $inc: { quantity: -item.quantity } })
    }

    for (const item of orderItems) {
      await databaseServices.cartItems.deleteOne({
        _id: item.cartItemId
      })
    }

    await databaseServices.carts.updateOne({ _id: cart._id }, { $set: { updatedAt: new Date() } })

    return {
      message: ORDER_MESSAGES.ORDER_CREATED_SUCCESS,
      result: {
        _id: orderId,
        totalPrice: finalPrice,
        status: OrderStatus.Pending,
        buyerInfo: {
          accountId: new ObjectId(accountId)
        },
        receiverInfo,
        items: orderDetailsForReturn,
        createdAt: now
      }
    }
  }

  async cancelOrder(accountId: string, orderId: string, reason: string) {
    const order = await databaseServices.orders.findOne({
      _id: new ObjectId(orderId),
      'buyerInfo.accountId': new ObjectId(accountId)
    })

    if (!order) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: ORDER_MESSAGES.ORDER_NOT_FOUND
      })
    }

    if (order.status !== OrderStatus.Pending) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_CANCEL_ORDER
      })
    }

    const orderDetails = await databaseServices.orderDetails.find({ orderId: order._id }).toArray()

    const productUpdatePromises = orderDetails.map(async (detail) => {
      const product = await databaseServices.products.findOne({
        name: detail.productName
      })

      if (product) {
        await databaseServices.products.updateOne({ _id: product._id }, { $inc: { quantity: detail.quantity } })
      }
    })

    await Promise.all(productUpdatePromises)

    const date = new Date()

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Cancelled,
          updatedAt: date,
          statusHistory: [{ status: OrderStatus.Cancelled, timestamp: date, reason: reason }]
        }
      }
    )

    return {
      message: ORDER_MESSAGES.ORDER_CANCELLED_SUCCESS,
      result: {
        _id: order._id,
        status: OrderStatus.Cancelled,
        updatedAt: new Date()
      }
    }
  }

  async getSellerOrders(accountId: string) {
    const products = await databaseServices.products.find({ createdBy: new ObjectId(accountId) }).toArray()

    if (products.length === 0) {
      return {
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        result: []
      }
    }

    const productNames = products.map((product) => product.name)

    const orderDetails = await databaseServices.orderDetails.find({ productName: { $in: productNames } }).toArray()

    if (orderDetails.length === 0) {
      return {
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        result: []
      }
    }

    const orderIds = [...new Set(orderDetails.map((detail) => detail.orderId))]

    const orders = await databaseServices.orders
      .find({ _id: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .toArray()

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = orderDetails.filter(
          (detail) => detail.orderId.equals(order._id) && productNames.includes(detail.productName)
        )

        const buyerInfo = await databaseServices.accounts.findOne(
          {
            _id: order.buyerInfo.accountId
          },
          { projection: { password: 0, passwordConfirm: 0 } }
        )

        return {
          ...order,
          items: details,
          buyer: buyerInfo || {}
        }
      })
    )

    return {
      message: ORDER_MESSAGES.ORDERS_FETCHED_SUCCESS,
      result: ordersWithDetails
    }
  }

  private async validateOrderBelongsToSeller(createdBy: string, orderId: ObjectId) {
    const products = await databaseServices.products.find({ createdBy: new ObjectId(createdBy) }).toArray()

    if (products.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: ORDER_MESSAGES.ORDER_NOT_BELONG_TO_SELLER
      })
    }

    const productNames = products.map((product) => product.name)

    const orderDetail = await databaseServices.orderDetails.findOne({
      orderId,
      productName: { $in: productNames }
    })

    if (!orderDetail) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: ORDER_MESSAGES.ORDER_NOT_BELONG_TO_SELLER
      })
    }

    return true
  }

  async confirmOrder(createdBy: string, orderId: string) {
    if (!ObjectId.isValid(orderId)) {
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

    if (order.status !== OrderStatus.Pending) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_CONFIRM_ORDER
      })
    }

    await this.validateOrderBelongsToSeller(createdBy, order._id)

    const date = new Date()

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Confirmed,
          updatedAt: date,
          statusHistory: [{ status: OrderStatus.Confirmed, timestamp: date }]
        }
      }
    )
    return {
      message: ORDER_MESSAGES.ORDER_CONFIRMED_SUCCESS,
      result: {
        _id: order._id,
        status: OrderStatus.Confirmed,
        updatedAt: new Date()
      }
    }
  }

  async processOrder(createdBy: string, orderId: string) {
    if (!ObjectId.isValid(orderId)) {
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

    if (order.status !== OrderStatus.Confirmed) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_PROCESS_ORDER
      })
    }

    await this.validateOrderBelongsToSeller(createdBy, order._id)

    const date = new Date()

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Processing,
          updatedAt: date,
          statusHistory: [{ status: OrderStatus.Processing, timestamp: date }]
        }
      }
    )

    return {
      message: ORDER_MESSAGES.ORDER_PROCESSED_SUCCESS,
      result: {
        _id: order._id,
        status: OrderStatus.Processing,
        updatedAt: new Date()
      }
    }
  }

  async sellerCancelOrder(createdBy: string, orderId: string, reason: string) {
    if (!ObjectId.isValid(orderId)) {
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

    if (order.status !== OrderStatus.Pending) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_CANCEL_ORDER
      })
    }

    await this.validateOrderBelongsToSeller(createdBy, order._id)

    const orderDetails = await databaseServices.orderDetails.find({ orderId: order._id }).toArray()

    const productUpdatePromises = orderDetails.map(async (detail) => {
      const product = await databaseServices.products.findOne({
        name: detail.productName
      })

      if (product) {
        await databaseServices.products.updateOne({ _id: product._id }, { $inc: { quantity: detail.quantity } })
      }
    })

    await Promise.all(productUpdatePromises)

    const date = new Date()

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Cancelled,
          updatedAt: date,
          statusHistory: [{ status: OrderStatus.Cancelled, timestamp: date, reason: reason }]
        }
      }
    )

    // Create compensation promotion for Banking payments
    if (order.paymentMethod === PaymentMethod.Banking) {
      const buyerAccountId = order.buyerInfo.accountId

      // Create a single-use promotion for the buyer
      const today = new Date()
      const endDate = new Date()
      endDate.setMonth(today.getMonth() + 1) // Promotion valid for 1 month
      const orderValue = Number(order.totalPrice)

      const compensationPromotion = new Promotions({
        name: `Refund for Order #${order._id}`,
        discountAmount: orderValue, // Exact amount refund
        discountRate: 0, // No percentage discount
        startDate: today,
        endDate: endDate,
        sellerId: new ObjectId(createdBy),
        isActive: true,
        singleUse: true,
        assignedTo: buyerAccountId,
        used: false
      })

      await databaseServices.promotions.insertOne(compensationPromotion)
    }

    return {
      message: ORDER_MESSAGES.ORDER_CANCELLED_SUCCESS,
      result: {
        _id: order._id,
        status: OrderStatus.Cancelled,
        updatedAt: new Date(),
        compensationAdded: order.paymentMethod === PaymentMethod.Banking
      }
    }
  }

  async sellerCompleteOrder(createdBy: string, orderId: string) {
    if (!ObjectId.isValid(orderId)) {
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

    if (order.status !== OrderStatus.Processing) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_COMPLETE_ORDER
      })
    }

    await this.validateOrderBelongsToSeller(createdBy, order._id)

    const date = new Date()

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Completed,
          updatedAt: date,
          statusHistory: [{ status: OrderStatus.Processing, timestamp: date }]
        }
      }
    )

    return {
      message: ORDER_MESSAGES.ORDER_COMPLETED_SUCCESS,
      result: {
        _id: order._id,
        status: OrderStatus.Completed,
        updatedAt: new Date()
      }
    }
  }

  async completeOrder(accountId: string, orderId: string) {
    if (!ObjectId.isValid(orderId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.ORDER_NOT_FOUND
      })
    }

    const order = await databaseServices.orders.findOne({
      _id: new ObjectId(orderId),
      'buyerInfo.accountId': new ObjectId(accountId)
    })

    if (!order) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: ORDER_MESSAGES.ORDER_NOT_FOUND
      })
    }

    if (order.status !== OrderStatus.Processing) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_COMPLETE_ORDER
      })
    }

    const date = new Date()

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Completed,
          statusHistory: [{ status: OrderStatus.Processing, timestamp: date }],
          updatedAt: date
        }
      }
    )

    return {
      message: ORDER_MESSAGES.ORDER_COMPLETED_SUCCESS,
      result: {
        _id: order._id,
        status: OrderStatus.Completed,
        updatedAt: new Date()
      }
    }
  }

  async getUserPromotions(accountId: string) {
    const now = new Date()

    const generalPromotions = await databaseServices.promotions
      .find({
        isActive: true,
        singleUse: { $ne: true },
        startDate: { $lte: now },
        endDate: { $gt: now }
      })
      .toArray()

    const userPromotions = await databaseServices.promotions
      .find({
        isActive: true,
        singleUse: true,
        assignedTo: new ObjectId(accountId),
        used: false,
        startDate: { $lte: now },
        endDate: { $gt: now }
      })
      .toArray()

    // Transform promotions to include readable information for frontend
    const transformedPromotions = [...generalPromotions, ...userPromotions].map((promotion) => {
      let discountInfo = ''

      if (promotion.discountAmount && promotion.discountAmount > 0) {
        discountInfo = `${promotion.discountAmount.toLocaleString()} VND off`
      } else if (promotion.discountRate && promotion.discountRate > 0) {
        discountInfo = `${promotion.discountRate}% off`

        if (promotion.maxDiscountAmount) {
          discountInfo += ` (up to ${promotion.maxDiscountAmount.toLocaleString()} VND)`
        }
      }

      return {
        _id: promotion._id,
        name: promotion.name,
        discountInfo,
        discountRate: promotion.discountRate,
        discountAmount: promotion.discountAmount,
        maxDiscountAmount: promotion.maxDiscountAmount,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        expiresIn: Math.ceil((promotion.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), // Days until expiration
        isUserSpecific: promotion.singleUse && promotion.assignedTo ? true : false
      }
    })

    transformedPromotions.sort((a, b) => a.expiresIn - b.expiresIn)

    return {
      message: ORDER_MESSAGES.PROMOTIONS_FETCHED_SUCCESS,
      result: transformedPromotions
    }
  }
}

const orderService = new OrderService()
export default orderService
