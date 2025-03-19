import { createClient, RedisClientType } from 'redis'
import { config } from 'dotenv'
config()

const uri = process.env.REDIS_URL as string
const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:'

class RedisServices {
  private client: RedisClientType

  constructor() {
    this.client = createClient({
      url: uri
    })

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err)
    })

    this.client.on('connect', () => {
      console.log('Connected to Redis')
    })
  }

  async connect() {
    try {
      await this.client.connect()
      console.log('Successfully connected to Redis!')
    } catch (error) {
      console.error('Failed to connect to Redis', error)
      throw error
    }
  }

  async set(key: string, value: string, expire: number) {
    await this.client.setEx(key, expire, value)
  }

  async get(key: string) {
    return await this.client.get(key)
  }

  async del(key: string) {
    await this.client.del(key)
  }

  // New methods for token blacklisting
  async blacklistToken(token: string, expiresInSeconds: number) {
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`
    await this.client.setEx(key, expiresInSeconds, '1')
    console.log(`Token blacklisted for ${expiresInSeconds} seconds: ${token.substring(0, 10)}...`)
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`
    const result = await this.client.get(key)
    return result !== null
  }
}

const redisServices = new RedisServices()
export default redisServices
