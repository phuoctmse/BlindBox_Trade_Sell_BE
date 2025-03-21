import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import Accounts from '~/models/schemas/Account.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Products from '~/models/schemas/Product.schema'
import Beads from '~/models/schemas/Bead.schema'
import Cart from '~/models/schemas/Cart.schema'
import CartItem from '~/models/schemas/CartItem.schema'
import BeadDetails from '~/models/schemas/BeadDetails.schema'
import Orders from '~/models/schemas/Order.schema'
import OrderDetails from '~/models/schemas/OrderDetail.schema'
import Promotions from '~/models/schemas/Promotion.schema'
import Transactions from '~/models/schemas/Transaction.schema'
import CreditConversions from '~/models/schemas/CreditConversion.schema'
import Feedbacks from '~/models/schemas/Feedback.schema'
import TradePosts from '~/models/schemas/TradePost.schema'
import TradeProposals from '~/models/schemas/TradeProposal.schema'
config()

const uri = process.env.MONGODB_URL as string

class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Failed to connect to MongoDB', error)
      throw error
    }
  }

  get accounts(): Collection<Accounts> {
    return this.db.collection(process.env.DB_ACCOUNTS_COLLECTION as string)
  }

  get products(): Collection<Products> {
    return this.db.collection(process.env.DB_PRODUCTS_COLLECTION as string)
  }

  get beads(): Collection<Beads> {
    return this.db.collection(process.env.DB_BEADS_COLLECTION as string)
  }

  get beadDetails(): Collection<BeadDetails> {
    return this.db.collection(process.env.DB_BEAD_DETAILS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get carts(): Collection<Cart> {
    return this.db.collection(process.env.DB_CARTS_COLLECTION as string)
  }

  get cartItems(): Collection<CartItem> {
    return this.db.collection(process.env.DB_CART_ITEMS_COLLECTION as string)
  }

  get orders(): Collection<Orders> {
    return this.db.collection(process.env.DB_ORDERS_COLLECTION as string)
  }

  get orderDetails(): Collection<OrderDetails> {
    return this.db.collection(process.env.DB_ORDER_DETAILS_COLLECTION as string)
  }

  get promotions(): Collection<Promotions> {
    return this.db.collection(process.env.DB_PROMOTIONS_COLLECTION as string)
  }

  get transactions(): Collection<Transactions> {
    return this.db.collection(process.env.DB_TRANSACTIONS_COLLECTION as string)
  }

  get creditConversion(): Collection<CreditConversions> {
    return this.db.collection(process.env.DB_CREDIT_CONVERSION_COLLECTION as string)
  }

  get feedbacks(): Collection<Feedbacks> {
    return this.db.collection(process.env.DB_FEEDBACKS_COLLECTION as string)
  }

  get tradePosts(): Collection<TradePosts> {
    return this.db.collection(process.env.DB_TRADE_POSTS_COLLECTION as string)
  }

  get tradeProposals(): Collection<TradeProposals> {
    return this.db.collection(process.env.DB_TRADE_PROPOSALS_COLLECTION as string)
  }

  indexAccounts() {
    this.accounts.createIndex({ email: 1 }, { unique: true })
    this.accounts.createIndex({ userName: 1 }, { unique: true })
    this.accounts.createIndex({ email: 1, password: 1 })
  }

  indexRefreshTokens() {
    this.refreshTokens.createIndex({ token: 1 })
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  indexProducts() {
    this.products.createIndex({ name: 1 })
    this.products.createIndex({ beadId: 1 })
    this.products.createIndex({ createdBy: 1 })
    this.products.createIndex({ slug: 1, category: 1 })
  }

  indexCarts() {
    this.carts.createIndex({ accountId: 1 }, { unique: true })
  }

  indexCartItems() {
    this.cartItems.createIndex({ cartId: 1, productId: 1 })
  }

  indexOrders() {
    this.orders.createIndex({ _id: 1, 'buyerInfo.accountId': 1 }, { unique: true })
  }

  indexOrderDetails() {
    this.orderDetails.createIndex({ orderId: 1, productName: 1 })
  }

  indexPromotions() {
    this.promotions.createIndex({ sellerId: 1 })
  }

  indexFeedbacks() {
    this.feedbacks.createIndex({ productId: 1, accountId: 1 }, { unique: true })
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
