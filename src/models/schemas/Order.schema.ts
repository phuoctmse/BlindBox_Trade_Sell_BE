import { Double, ObjectId } from "mongodb";
import { OrderStatus } from "~/constants/enums";

interface OrderType{
    _id : ObjectId;
    accountId: ObjectId;
    totalPrice: Double;
    promotionId: ObjectId;
    status: OrderStatus;
    createdAt?: Date
    updatedAt?: Date
}

export default class Orders{
    _id: ObjectId;
    accountId: ObjectId;
    totalPrice: Double;
    promotionId: ObjectId;
    status: OrderStatus;
    createdAt?: Date
    updatedAt?: Date
    
    constructor(order : OrderType){
        const date = new Date();
        this._id = order._id;
        this.accountId = order.accountId;
        this.totalPrice = order.totalPrice;
        this.promotionId = order.promotionId;
        this.status = order.status;
        this.createdAt = date;
        this.updatedAt = date        
    }
}