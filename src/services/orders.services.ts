import { Double, ObjectId } from "mongodb"
import databaseServices from "./database.services"
import Orders from "~/models/schemas/Order.schema"
import { OrderStatus } from "~/constants/enums"
import { ORDER_MESSAGES } from "~/constants/messages"

class OrderService {
    async createOrder(accountId: string, totalPrice: number, promotionId: string) {
        const newOrderId = new ObjectId()
        const result = await databaseServices.orders.insertOne(
            new Orders({
                _id: newOrderId,
                accountId: new ObjectId(accountId),
                totalPrice: new Double(totalPrice),
                promotionId: new ObjectId(promotionId),
                status: OrderStatus.Processing
            })
        )
        return {
            message: ORDER_MESSAGES.ORDER_CREATED
        }
    }

    async getOrderById(orderId: string) {
        const result = await databaseServices.orders.findOne({
            _id: new ObjectId(orderId)
        })
        return {
            message: ORDER_MESSAGES.ORDER_FETCHED,
            result
        }
    }
}

export default new OrderService()