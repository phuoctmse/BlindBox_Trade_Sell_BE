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
      image: product.image,
      sellerId: product.createdBy
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

    // Gather all items from cart
    const cartItemsDetails = []
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

      cartItemsDetails.push({
        cartItemId: item._id,
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image || '',
        createdBy: product.createdBy
      })
    }

    // Calculate total price for all items
    let totalPrice = 0
    for (const item of cartItemsDetails) {
      totalPrice += Number(item.price) * item.quantity
    }

    // Apply promotion if any
    const finalPrice = await this.applyPromotion(totalPrice, payload.promotionId, accountId)

    // Create a single order for the entire cart
    const now = new Date()
    const orderId = new ObjectId()
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

    // Create order details for all items
    const orderDetailsForReturn = []

    // Process each item and include seller information for tracking
    for (const item of cartItemsDetails) {
      // Create order detail with seller reference
      const orderDetail = new OrderDetails({
        orderId: orderId,
        productName: item.productName,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        sellerId: item.createdBy // Include the seller ID in the order detail
      })

      await databaseServices.orderDetails.insertOne(orderDetail)

      orderDetailsForReturn.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        sellerId: item.createdBy ? item.createdBy.toString() : null
      })

      // Update product inventory
      await databaseServices.products.updateOne({ _id: item.productId }, { $inc: { quantity: -item.quantity } })

      // Remove item from cart
      await databaseServices.cartItems.deleteOne({ _id: item.cartItemId })
    }

    // Update cart's last modified timestamp
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
    const orderDetails = await databaseServices.orderDetails
      .find({
        sellerId: new ObjectId(accountId)
      })
      .toArray()

    if (orderDetails.length === 0) {
      return {
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        result: []
      }
    }

    const orderIds = [...new Set(orderDetails.map((detail) => detail.orderId))]

    const orders = await databaseServices.orders
      .find({ _id: { $in: orderIds } })
      .project({ totalPrice: 0 })
      .sort({ createdAt: -1 })
      .toArray()

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = orderDetails.filter(
          (detail) => detail.orderId.equals(order._id) && detail.sellerId.equals(new ObjectId(accountId))
        )
        let totalPrice = 0
        for (const detail of details) {
          totalPrice += Number(detail.price) * detail.quantity
        }

        const buyerInfo = await databaseServices.accounts.findOne(
          { _id: order.buyerInfo.accountId },
          { projection: { password: 0, passwordConfirm: 0 } }
        )

        return {
          ...order,
          items: details,
          totalPrice,
          buyer: buyerInfo || {}
        }
      })
    )

    return {
      message: ORDER_MESSAGES.ORDERS_FETCHED_SUCCESS,
      result: ordersWithDetails
    }
  }

  private async validateOrderBelongsToSeller(accountId: string, orderId: ObjectId) {
    const orderDetail = await databaseServices.orderDetails.findOne({
      orderId,
      sellerId: new ObjectId(accountId)
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

    if (
      order.status !== OrderStatus.Pending &&
      order.status !== OrderStatus.PartiallyConfirmed &&
      order.status !== OrderStatus.PartiallyCancelled
    ) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_CONFIRM_ORDER
      })
    }

    // Find order details belonging to this seller that are still pending
    const sellerOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        sellerId: new ObjectId(createdBy),
        status: OrderStatus.Pending
      })
      .toArray()

    if (sellerOrderDetails.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: ORDER_MESSAGES.ORDER_NOT_BELONG_TO_SELLER
      })
    }

    const date = new Date()

    // Update all seller's order details to confirmed
    await databaseServices.orderDetails.updateMany(
      {
        orderId: order._id,
        sellerId: new ObjectId(createdBy),
        status: OrderStatus.Pending
      },
      {
        $set: {
          status: OrderStatus.Confirmed,
          statusHistory: [{ status: OrderStatus.Confirmed, timestamp: date }]
        }
      }
    )

    // Check if all order details have the same confirmed status
    const allOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        status: { $ne: OrderStatus.Cancelled } // Exclude cancelled items
      })
      .toArray()

    const allConfirmed =
      allOrderDetails.length > 0 && allOrderDetails.every((detail) => detail.status === OrderStatus.Confirmed)

    if (allConfirmed) {
      // If all active details are confirmed, update the main order status
      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            status: OrderStatus.Confirmed,
            updatedAt: date
          },
          $push: {
            statusHistory: { status: OrderStatus.Confirmed, timestamp: date }
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
    } else {
      // Otherwise, set to partially confirmed
      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            status: OrderStatus.PartiallyConfirmed,
            updatedAt: date
          },
          $push: {
            statusHistory: {
              status: OrderStatus.PartiallyConfirmed,
              timestamp: date,
              confirmedItems: sellerOrderDetails.map((detail) => ({
                productName: detail.productName,
                quantity: detail.quantity,
                sellerId: new ObjectId(createdBy)
              }))
            }
          }
        }
      )

      return {
        message: ORDER_MESSAGES.ORDER_DETAILS_CONFIRMED_SUCCESS,
        result: {
          _id: order._id,
          status: OrderStatus.PartiallyConfirmed,
          updatedAt: new Date(),
          confirmedItems: sellerOrderDetails.map((detail) => ({
            productId: detail.productId,
            productName: detail.productName,
            quantity: detail.quantity,
            sellerId: createdBy
          }))
        }
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

    if (
      order.status !== OrderStatus.Confirmed &&
      order.status !== OrderStatus.PartiallyConfirmed &&
      order.status !== OrderStatus.PartiallyProcessing
    ) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_PROCESS_ORDER
      })
    }

    // Find order details belonging to this seller that are confirmed
    const sellerOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        sellerId: new ObjectId(createdBy),
        status: OrderStatus.Confirmed
      })
      .toArray()

    if (sellerOrderDetails.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: ORDER_MESSAGES.ORDER_DETAILS_NOT_FOUND
      })
    }

    const date = new Date()

    // Update all seller's order details to processing
    await databaseServices.orderDetails.updateMany(
      {
        orderId: order._id,
        sellerId: new ObjectId(createdBy),
        status: OrderStatus.Confirmed
      },
      {
        $set: {
          status: OrderStatus.Processing,
          statusHistory: [{ status: OrderStatus.Processing, timestamp: date }]
        }
      }
    )

    // Check status of all active (non-cancelled) order details
    const allOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        status: { $ne: OrderStatus.Cancelled } // Exclude cancelled items
      })
      .toArray()

    // Check if all items are in processing or completed state
    const allProcessing =
      allOrderDetails.length > 0 &&
      allOrderDetails.every(
        (detail) => detail.status === OrderStatus.Processing || detail.status === OrderStatus.Completed
      )

    if (allProcessing) {
      // If all details are processing or completed, update the main order status
      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            status: OrderStatus.Processing,
            updatedAt: date
          },
          $push: {
            statusHistory: { status: OrderStatus.Processing, timestamp: date }
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
    } else {
      // Otherwise set to partially processing
      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            status: OrderStatus.PartiallyProcessing,
            updatedAt: date
          },
          $push: {
            statusHistory: {
              status: OrderStatus.PartiallyProcessing,
              timestamp: date,
              processedItems: sellerOrderDetails.map((detail) => ({
                productName: detail.productName,
                quantity: detail.quantity,
                sellerId: new ObjectId(createdBy)
              }))
            }
          }
        }
      )

      return {
        message: ORDER_MESSAGES.ORDER_DETAILS_PROCESSED_SUCCESS,
        result: {
          _id: order._id,
          status: OrderStatus.PartiallyProcessing,
          updatedAt: new Date(),
          processedItems: sellerOrderDetails.map((detail) => ({
            productId: detail.productId,
            productName: detail.productName,
            quantity: detail.quantity,
            sellerId: createdBy
          }))
        }
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

    if (order.status !== OrderStatus.Pending && order.status !== OrderStatus.Confirmed) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_CANCEL_ORDER
      })
    }

    const sellerOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        sellerId: new ObjectId(createdBy)
      })
      .toArray()

    if (sellerOrderDetails.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: ORDER_MESSAGES.ORDER_NOT_BELONG_TO_SELLER
      })
    }

    let cancelledItemsTotal = 0
    for (const detail of sellerOrderDetails) {
      cancelledItemsTotal += Number(detail.price) * detail.quantity
    }

    const productUpdatePromises = sellerOrderDetails.map(async (detail) => {
      const product = await databaseServices.products.findOne({
        name: detail.productName
      })

      if (product) {
        await databaseServices.products.updateOne({ _id: product._id }, { $inc: { quantity: detail.quantity } })
      }
    })

    await Promise.all(productUpdatePromises)

    // Get remaining order details to check if order should be fully cancelled
    const remainingOrderDetails = await databaseServices.orderDetails.find({ orderId: order._id }).toArray()

    const date = new Date()

    if (remainingOrderDetails.length === 0) {
      // If no items remain, cancel the entire order
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

        const compensationPromotion = new Promotions({
          name: `Refund for Order #${order._id}`,
          discountAmount: Number(order.totalPrice), // Exact amount refund
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
    } else {
      // Update order with new total price and partial cancellation status
      const newTotalPrice = Number(order.totalPrice) - cancelledItemsTotal

      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            totalPrice: new Double(newTotalPrice),
            updatedAt: date,
            statusHistory: [
              {
                status: OrderStatus.PartiallyCancelled,
                timestamp: date,
                reason: reason,
                cancelledItems: sellerOrderDetails.map((detail) => ({
                  productName: detail.productName,
                  quantity: detail.quantity,
                  price: detail.price
                }))
              }
            ]
          }
        }
      )

      // Create partial compensation promotion for Banking payments
      if (order.paymentMethod === PaymentMethod.Banking) {
        const buyerAccountId = order.buyerInfo.accountId

        // Create a single-use promotion for the buyer
        const today = new Date()
        const endDate = new Date()
        endDate.setMonth(today.getMonth() + 1) // Promotion valid for 1 month

        const compensationPromotion = new Promotions({
          name: `Partial Refund for Order #${order._id} - ${sellerOrderDetails.map((detail) => detail.productName).join(', ')}`,
          discountAmount: cancelledItemsTotal, // Refund only the cancelled items amount
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
        message: ORDER_MESSAGES.ORDER_PARTIALLY_CANCELLED_SUCCESS,
        result: {
          _id: order._id,
          status: OrderStatus.PartiallyCancelled,
          updatedAt: new Date(),
          newTotalPrice,
          cancelledItems: sellerOrderDetails.map((detail) => ({
            productName: detail.productName,
            quantity: detail.quantity,
            price: detail.price
          })),
          compensationAdded: order.paymentMethod === PaymentMethod.Banking
        }
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

    if (
      order.status !== OrderStatus.Processing &&
      order.status !== OrderStatus.PartiallyProcessing &&
      order.status !== OrderStatus.PartiallyCompleted
    ) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: ORDER_MESSAGES.CANNOT_COMPLETE_ORDER
      })
    }

    // Find order details belonging to this seller that are processing
    const sellerOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        sellerId: new ObjectId(createdBy),
        status: OrderStatus.Processing
      })
      .toArray()

    if (sellerOrderDetails.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: ORDER_MESSAGES.ORDER_DETAILS_NOT_FOUND
      })
    }

    const date = new Date()

    // Update all seller's order details to completed
    await databaseServices.orderDetails.updateMany(
      {
        orderId: order._id,
        sellerId: new ObjectId(createdBy),
        status: OrderStatus.Processing
      },
      {
        $set: {
          status: OrderStatus.Completed,
          statusHistory: [{ status: OrderStatus.Completed, timestamp: date }]
        }
      }
    )

    // Check status of all active (non-cancelled) order details
    const allOrderDetails = await databaseServices.orderDetails
      .find({
        orderId: order._id,
        status: { $ne: OrderStatus.Cancelled } // Exclude cancelled items
      })
      .toArray()

    const allCompleted =
      allOrderDetails.length > 0 && allOrderDetails.every((detail) => detail.status === OrderStatus.Completed)

    if (allCompleted) {
      // If all active details are completed, update the main order status
      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            status: OrderStatus.Completed,
            updatedAt: date
          },
          $push: {
            statusHistory: { status: OrderStatus.Completed, timestamp: date }
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
    } else {
      // Otherwise mark as partially completed
      await databaseServices.orders.updateOne(
        { _id: order._id },
        {
          $set: {
            status: OrderStatus.PartiallyCompleted,
            updatedAt: date
          },
          $push: {
            statusHistory: {
              status: OrderStatus.PartiallyCompleted,
              timestamp: date,
              completedItems: sellerOrderDetails.map((detail) => ({
                productName: detail.productName,
                quantity: detail.quantity,
                sellerId: new ObjectId(createdBy)
              }))
            }
          }
        }
      )

      return {
        message: ORDER_MESSAGES.ORDER_DETAILS_COMPLETED_SUCCESS,
        result: {
          _id: order._id,
          status: OrderStatus.PartiallyCompleted,
          updatedAt: new Date(),
          completedItems: sellerOrderDetails.map((detail) => ({
            productId: detail.productId,
            productName: detail.productName,
            quantity: detail.quantity,
            sellerId: createdBy
          }))
        }
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
