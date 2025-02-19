import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import Accounts from '~/models/schemas/Account.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Products from '~/models/schemas/Product.schema'
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

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
