import express from 'express'
import accountsRouter from './routes/account.routes'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'

const app = express()
const port = 5000

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../blindbox-swagger.yaml'))

// Connect to database
databaseServices.connect()

// Middleware
app.use(express.json())

// Setup Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Routes
app.use('/accounts', accountsRouter)

// Error handling
app.use(defaultErrorHandler as any)

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
