import express from 'express'
import accountsRouter from './routes/account.routes'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

const app = express()
const port = 5000

// Connect to database
databaseServices.connect()

// Middleware
app.use(express.json())

// Routes
app.use('/accounts', accountsRouter)

//Error handling
app.use(defaultErrorHandler as any)
// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
