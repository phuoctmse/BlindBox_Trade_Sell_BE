import { Double, ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CART_MESSAGES, ORDER_MESSAGES, PRODUCT_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { CartOrderReqBody, CreateOrderReqBody, DirectOrderReqBody } from '~/models/requests/Order.requests'
import Orders from '~/models/schemas/Order.schema'
import OrderDetails from '~/models/schemas/OrderDetail.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderStatus } from '~/constants/enums'

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

        return {
          ...order,
          items: details
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

  private async applyPromotion(subTotal: number, promotionId?: string) {
    if (!promotionId) return subTotal
    const promotion = await databaseServices.promotions.findOne({
      _id: new ObjectId(promotionId)
    })

    if (!promotion) return subTotal

    const now = new Date()
    if (now > promotion.endDate || now < promotion.startDate) {
      return subTotal
    }

    if (!promotion.isActive) {
      return subTotal
    }
    const discountAmount = (subTotal * promotion.discountRate) / 100

    return subTotal - discountAmount
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
    const finalPrice = await this.applyPromotion(subTotal, payload.promotionId)

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

    const finalPrice = await this.applyPromotion(subTotal, payload.promotionId)

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

  async cancelOrder(accountId: string, orderId: string) {

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

    await databaseServices.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status: OrderStatus.Cancelled,
          updatedAt: new Date()
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
}

const orderService = new OrderService()
export default orderService
