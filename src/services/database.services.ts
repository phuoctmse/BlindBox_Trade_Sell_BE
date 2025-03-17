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
}

const databaseServices = new DatabaseServices()
export default databaseServices
