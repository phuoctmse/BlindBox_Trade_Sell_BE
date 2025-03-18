import cron from 'node-cron'
import { OrderStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import databaseServices from '~/services/database.services'
import { ORDER_MESSAGES } from '~/constants/messages'

const getThreeDaysAgo = () => {
  const date = new Date()
  date.setDate(date.getDate() - 3)
  return date
}

export const setupAutoCompleteOrders = () => {
  console.log('Setting up auto-complete order cron job')

  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        console.log('Running auto-complete orders task...')

        const threeDaysAgo = getThreeDaysAgo()

        const orders = await databaseServices.orders
          .find({
            status: OrderStatus.Processing,
            updatedAt: { $lte: threeDaysAgo }
          })
          .toArray()

        if (orders.length === 0) {
          console.log('No orders to auto-complete')
          return
        }

        console.log(`Found ${orders.length} orders to auto-complete`)

        const result = await databaseServices.orders.updateMany(
          {
            status: OrderStatus.Processing,
            updatedAt: { $lte: threeDaysAgo }
          },
          {
            $set: {
              status: OrderStatus.Completed,
              updatedAt: new Date(),
              autoCompleted: true
            }
          }
        )

        console.log(`Auto-completed ${result.modifiedCount} orders`)
      } catch (error) {
        console.error('Error in auto-complete orders task:', error)
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh'
    }
  )

  console.log('Auto-complete order cron job set up successfully')
}

export const setupCleanExpiredTokens = () => {
  console.log('Setting up clean expired refresh tokens cron job')

  cron.schedule(
    '0 3 * * *',
    async () => {
      try {
        console.log('Running clean expired refresh tokens task...')

        const currentDate = new Date()

        const result = await databaseServices.refreshTokens.deleteMany({
          exp: { $lt: currentDate }
        })

        console.log(`Cleaned ${result.deletedCount} expired refresh tokens`)
      } catch (error) {
        console.error('Error in cleaning expired refresh tokens task:', error)
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh'
    }
  )

  console.log('Clean expired refresh tokens cron job set up successfully')
}
