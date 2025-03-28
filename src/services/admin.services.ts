import databaseServices from './database.services'
import { Double, ObjectId } from 'mongodb'
import { AccountVerifyStatus, Category, OrderStatus, ProductStatus, TradeStatus, TypeBeads } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { ADMIN_MESSAGES, PRODUCT_MESSAGES, TRADE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreditConversion } from '~/models/requests/Admin.requests'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import Beads from '~/models/schemas/Bead.schema'

class AdminService {
  async getAllAccounts() {
    const result = await databaseServices.accounts.find().toArray()
    return {
      message: 'Accounts fetched successfully',
      result
    }
  }

  async updateAccountVerifyStatus(accountId: string, verifyStatus: AccountVerifyStatus) {
    const result = await databaseServices.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { verify: verifyStatus } }
    )
    return {
      message: 'Account verification status updated successfully',
      result
    }
  }

  async updateBlindboxStatus(slug: string, id: string, status?: ProductStatus) {
    const result = await databaseServices.products.updateOne(
      {
        slug,
        _id: new ObjectId(id)
      },
      { $set: { status } }
    )
    return {
      message: PRODUCT_MESSAGES.PRODUCT_UPDATED_SUCCESS,
      result
    }
  }

  async createBeads(payload: CreateBeadsReqBody) {
    const newBeadId = new ObjectId()
    const bead = new Beads({
      _id: newBeadId,
      type: payload.type,
      price: payload.price
    })

    const result = await databaseServices.beads.insertOne(bead)

    return {
      message: PRODUCT_MESSAGES.BEAD_CREATED_SUCCESS,
      result
    }
  }

  async getAllBeads() {
    const result = await databaseServices.beads.find().toArray()
    return {
      message: PRODUCT_MESSAGES.BEAD_FETCHED_SUCCESS,
      result
    }
  }

  async getBeadsDetails(id: string) {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID }
    }
    const result = await databaseServices.beads.findOne({
      _id: new ObjectId(id)
    })
    if (!result) {
      return { success: false, message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND }
    }
    return {
      success: true,
      message: PRODUCT_MESSAGES.BEAD_FETCHED_SUCCESS,
      result
    }
  }

  async updateBead(id: string, payload: CreateBeadsReqBody) {
    const result = await databaseServices.beads.updateOne({ _id: new ObjectId(id) }, { $set: { ...payload } })
    return {
      message: PRODUCT_MESSAGES.BEAD_UPDATED_SUCCESS,
      result
    }
  }

  async deleteBead(id: string) {
    const linkedProduct = await databaseServices.products.findOne({
      beadId: new ObjectId(id)
    })
    if (linkedProduct) {
      return {
        message: PRODUCT_MESSAGES.BEAD_LINKED_WITH_PRODUCT,
        result: null
      }
    }
    const result = await databaseServices.beads.deleteOne({
      _id: new ObjectId(id)
    })
    return {
      message: PRODUCT_MESSAGES.BEAD_DELETED_SUCCESS,
      result
    }
  }

  async getAllProducts() {
    const result = await databaseServices.products.find({}).toArray()

    const formattedResult = result.map((product) => ({
      ...product,
      _id: product._id.toString()
    }))
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: formattedResult
    }
  }
  async getAllTradePosts() {
    const result = await databaseServices.tradePosts.find().toArray()
    return {
      message: TRADE_MESSAGES.TRADE_POSTS_FETCHED,
      result
    }
  }
  async updateTradePostStatus(id: string, status: number) {
    const tradePostId = new ObjectId(id)

    const tradePost = await databaseServices.tradePosts.findOne({ _id: tradePostId })
    const creditConversion = await databaseServices.creditConversion.findOne()
    if (!creditConversion) {
      throw new ErrorWithStatus({
        message: TRADE_MESSAGES.CREDIT_CONVERSION_NOT_FOUND,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    if (!tradePost) {
      return {
        message: TRADE_MESSAGES.TRADE_POST_NOT_FOUND,
        success: false
      }
    }

    if (status === TradeStatus.Cancelled && tradePost.status !== TradeStatus.Completed) {
      const creditToRefund = creditConversion.creditCharged

      await databaseServices.tradePosts.updateOne(
        { _id: tradePostId },
        {
          $set: {
            status,
            cancelledAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

      // If there are credits to refund and we know who to refund to
      if (creditToRefund > 0 && tradePost.authorId) {
        // Refund credits to the post author
        await databaseServices.accounts.updateOne(
          { _id: tradePost.authorId },
          { $inc: { remainingCredits: creditToRefund } }
        )

        return {
          message: TRADE_MESSAGES.TRADE_POST_CANCELLED_WITH_REFUND,
          result: {
            postId: tradePostId,
            authorId: tradePost.authorId,
            creditsRefunded: creditToRefund
          }
        }
      }

      return {
        message: TRADE_MESSAGES.TRADE_POST_CANCELLED,
        result: { postId: tradePostId }
      }
    }

    const result = await databaseServices.tradePosts.updateOne(
      { _id: tradePostId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    )

    return {
      message: TRADE_MESSAGES.TRADE_POST_STATUS_UPDATED,
      result
    }
  }

  async getTradePostDetails(id: string) {
    const result = await databaseServices.tradePosts.findOne({ _id: new ObjectId(id) })
    return {
      message: TRADE_MESSAGES.TRADE_POSTS_FETCHED,
      result
    }
  }
  async getCreditConversion() {
    const result = await databaseServices.creditConversion.find().toArray()
    return {
      message: ADMIN_MESSAGES.CREDIT_CONVERSION_FETCHED,
      result
    }
  }
  async updateCreditConversion(payload: CreditConversion) {
    const result = await databaseServices.creditConversion.updateOne(
      {},
      {
        $set: {
          rate: payload.rate,
          chargedCredit: payload.chargedCredit
        }
      }
    )
    return {
      message: ADMIN_MESSAGES.CREDIT_CONVERSION_UPDATED,
      result
    }
  }

  async getAllFeedbacks() {
    const result = await databaseServices.feedbacks.find().toArray()
    return {
      message: ADMIN_MESSAGES.FEEDBACKS_FETCHED_SUCCESS,
      result
    }
  }

  async deleteFeedback(feedbackId: string) {
    const result = await databaseServices.feedbacks.deleteOne({ _id: new ObjectId(feedbackId) })
    return {
      message: ADMIN_MESSAGES.FEEDBACK_DELETED_SUCCESS,
      result
    }
  }

  async deleteAccount(accountId: string) {
    const result = await databaseServices.accounts.deleteOne({ _id: new ObjectId(accountId) })
    return {
      message: ADMIN_MESSAGES.ACCOUNT_DELETED_SUCCESS,
      result
    }
  }

  async getProductWithAccessories() {
    const result = await databaseServices.products
      .find({
        accessories: { $exists: true, $ne: [] }
      })
      .toArray()

    const formattedProducts = result.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      quantity: product.quantity,
      price: product.price,
      category: product.category,
      image: product.image,
      createdBy: product.createdBy.toString(),
      status: product.status,
      brand: product.brand || '',
      feedBack: product.feedBack || [],
      openedItems: product.openedItems || {},
      blindBoxes: product.blindBoxes || {},
      accessories: product.accessories || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: formattedProducts
    }
  }

  async deleteProduct(productId: string) {
    const result = await databaseServices.products.deleteOne({ _id: new ObjectId(productId) })
    return {
      message: PRODUCT_MESSAGES.PRODUCT_DELETED_SUCCESS,
      result
    }
  }

  async getDashboardStats() {
    // Calculate date for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // ALL-TIME STATS
    // Product statistics
    const activeProducts = await databaseServices.products.countDocuments({
      status: ProductStatus.Active
    })

    const inactiveProducts = await databaseServices.products.countDocuments({
      status: ProductStatus.Inactive
    })

    const outOfStockProducts = await databaseServices.products.countDocuments({
      status: ProductStatus.Outstock
    })

    // Order statistics - all time
    const totalOrders = await databaseServices.orders.countDocuments({})

    const ordersByStatus = await databaseServices.orders
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray()

    const ordersStats = ordersByStatus.reduce((acc, curr) => {
      acc[OrderStatus[curr._id]] = curr.count
      return acc
    }, {})

    // User statistics - all time
    const totalUsers = await databaseServices.accounts.countDocuments({})

    const usersByVerifyStatus = await databaseServices.accounts
      .aggregate([{ $group: { _id: '$verify', count: { $sum: 1 } } }])
      .toArray()

    const usersStats = {
      total: totalUsers,
      verified: 0,
      unverified: 0,
      banned: 0
    }

    usersByVerifyStatus.forEach((stat) => {
      if (stat._id === AccountVerifyStatus.Verified) {
        usersStats.verified = stat.count
      } else if (stat._id === AccountVerifyStatus.Unverified) {
        usersStats.unverified = stat.count
      } else if (stat._id === AccountVerifyStatus.Banned) {
        usersStats.banned = stat.count
      }
    })

    // Trade post statistics - all time
    const totalTradePosts = await databaseServices.tradePosts.countDocuments({})

    const tradePostsByStatus = await databaseServices.tradePosts
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray()

    const tradePostsStats = tradePostsByStatus.reduce((acc, curr) => {
      // Convert numeric status to string name if needed
      const statusName = curr._id !== null ? TradeStatus[curr._id] || curr._id.toString() : 'null'
      acc[statusName] = curr.count
      return acc
    }, {})

    // LAST 30 DAYS STATS
    // Product statistics - last 30 days
    const newProductsCount = await databaseServices.products.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Products updated in last 30 days
    const updatedProductsCount = await databaseServices.products.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo },
      createdAt: { $lt: thirtyDaysAgo } // Exclude newly created products
    })

    // Order statistics - last 30 days
    const recentOrdersCount = await databaseServices.orders.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentOrdersByStatus = await databaseServices.orders
      .aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
      .toArray()

    const recentOrdersStats = recentOrdersByStatus.reduce((acc, curr) => {
      acc[OrderStatus[curr._id]] = curr.count
      return acc
    }, {})

    // User statistics - last 30 days
    const newUsersCount = await databaseServices.accounts.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentUsersByVerifyStatus = await databaseServices.accounts
      .aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$verify', count: { $sum: 1 } } }
      ])
      .toArray()

    const recentUsersStats = {
      total: newUsersCount,
      verified: 0,
      unverified: 0,
      banned: 0
    }

    recentUsersByVerifyStatus.forEach((stat) => {
      if (stat._id === AccountVerifyStatus.Verified) {
        recentUsersStats.verified = stat.count
      } else if (stat._id === AccountVerifyStatus.Unverified) {
        recentUsersStats.unverified = stat.count
      } else if (stat._id === AccountVerifyStatus.Banned) {
        recentUsersStats.banned = stat.count
      }
    })

    // Trade post statistics - last 30 days
    const recentTradePostsCount = await databaseServices.tradePosts.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentTradePostsByStatus = await databaseServices.tradePosts
      .aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
      .toArray()

    const recentTradePostsStats = recentTradePostsByStatus.reduce((acc, curr) => {
      const statusName = curr._id !== null ? TradeStatus[curr._id] || curr._id.toString() : 'null'
      acc[statusName] = curr.count
      return acc
    }, {})

    // Revenue statistics
    const totalRevenue = await databaseServices.orders
      .aggregate([
        { $match: { status: { $in: [OrderStatus.Completed] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
      .toArray()
      .then((result) => result[0]?.total || 0)

    const recentRevenue = await databaseServices.orders
      .aggregate([
        {
          $match: {
            status: { $in: [OrderStatus.Completed] },
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
      .toArray()
      .then((result) => result[0]?.total || 0)

    // Daily orders for last 30 days (for charts)
    const dailyOrdersStats = await databaseServices.orders
      .aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
      .toArray()

    // Transform dailyOrdersStats into a more usable format
    const dailyStats = dailyOrdersStats.map((day) => ({
      date: `${day._id.year}-${day._id.month.toString().padStart(2, '0')}-${day._id.day.toString().padStart(2, '0')}`,
      orders: day.count,
      revenue: day.revenue
    }))

    return {
      message: 'Dashboard statistics fetched successfully',
      result: {
        // All-time stats
        products: {
          active: activeProducts,
          inactive: inactiveProducts,
          outOfStock: outOfStockProducts,
          total: activeProducts + inactiveProducts + outOfStockProducts
        },
        orders: {
          total: totalOrders,
          byStatus: ordersStats
        },
        users: usersStats,
        tradePosts: {
          total: totalTradePosts,
          byStatus: tradePostsStats
        },
        revenue: {
          total: totalRevenue
        },

        // Last 30 days stats
        recent: {
          dateRange: {
            from: thirtyDaysAgo.toISOString(),
            to: new Date().toISOString()
          },
          products: {
            new: newProductsCount,
            updated: updatedProductsCount
          },
          orders: {
            total: recentOrdersCount,
            byStatus: recentOrdersStats
          },
          users: recentUsersStats,
          tradePosts: {
            total: recentTradePostsCount,
            byStatus: recentTradePostsStats
          },
          revenue: recentRevenue,
          dailyStats: dailyStats
        }
      }
    }
  }
}

const adminService = new AdminService()
export default adminService
