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
import { setupAutoCompleteOrders } from './utils/cronjob'
import { initSocketServer } from './utils/socket'
import http from 'http'
import feedbackRouter from './routes/feedback.routes'
import paymentRouter from './routes/payment.routes'
import redisServices from './services/redis.services'
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
  setupAutoCompleteOrders()
})
redisServices.connect()
// Middleware
app.use(express.json())

//Setup CORS
app.use(cors(corsOptions))

// Setup Cookie Parser
app.use(cookieParser())

app.use('/medias/images/', express.static(UPLOAD_DIR))

// Setup Swagger
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Routes
app.use('/accounts', accountsRouter)
app.use('/products', productsRouter)
app.use('/medias', mediasRouter)
app.use('/admins', adminRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)
app.use('/feedbacks', feedbackRouter)
app.use('/payment', paymentRouter)

// Error handling
app.use(defaultErrorHandler as any)

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
