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
config()

const app = express()
const port = process.env.PORT || 8080
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200
}

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../blindbox-swagger.yaml'))

// Init Folder Image
initFolder()

// Connect to database
databaseServices.connect()

// Middleware
app.use(express.json())

//Setup CORS
app.use(cors(corsOptions))

// Setup Cookie Parser
app.use(cookieParser())

// Setup Swagger
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Routes
app.use('/accounts', accountsRouter)
app.use('/products', productsRouter)
app.use('/medias', mediasRouter)

// Error handling
app.use(defaultErrorHandler as any)

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
