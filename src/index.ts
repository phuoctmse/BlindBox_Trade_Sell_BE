import express from 'express'
import accountsRouter from './routes/account.routes'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import cors from 'cors'
import { config } from 'dotenv'
import productsRouter from './routes/product.routes'
import cookieParser from 'cookie-parser'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import { UPLOAD_DIR } from './constants/dir'
import adminRouter from './routes/admin.routes'
import cartRouter from './routes/cart.routes'
import orderRouter from './routes/order.routes'
import { initSocketServer } from './utils/socket'
import http from 'http'
import feedbackRouter from './routes/feedback.routes'
import paymentRouter from './routes/payment.routes'
import redisServices from './services/redis.services'
import tradesRouter from './routes/trade.routes'
config()

const app = express()
const httpServer = http.createServer(app)
const port = process.env.PORT || 8080
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200
}

initSocketServer(httpServer)

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../blindbox-swagger.yaml'))

// Init Folder Image
initFolder()

// Connect to database
databaseServices.connect().then(() => {
  databaseServices.initIndexes()
})
redisServices.connect()
// Middleware
app.use(express.json())

//Setup CORS
app.use(cors(corsOptions))

// Setup Cookie Parser
app.use(cookieParser())

app.use('/medias/images/', express.static(UPLOAD_DIR))

// Setup Swagger - Keep this outside API version for documentation access
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Create API router for versioning
const apiRouter = express.Router()

// Mount all routes on the API router with their respective paths
apiRouter.use('/accounts', accountsRouter)
apiRouter.use('/products', productsRouter)
apiRouter.use('/medias', mediasRouter)
apiRouter.use('/admins', adminRouter)
apiRouter.use('/cart', cartRouter)
apiRouter.use('/orders', orderRouter)
apiRouter.use('/feedbacks', feedbackRouter)
apiRouter.use('/payment', paymentRouter)
apiRouter.use('/trade', tradesRouter)

// Mount the API router on the /api/v1 path
app.use('/api/v1', apiRouter)

// Error handling
app.use(defaultErrorHandler as any)

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
