import { Double, ObjectId } from "mongodb";

interface OrderDetailType{
    _id : ObjectId;
    productName: string;
    quantity: number;
    price: Double;
    image: string;
    orderId: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export default class OrderDetails{
    _id : ObjectId;
    productName: string;
    quantity: number;
    price: Double;
    image: string;
    orderId: ObjectId;
    constructor(orderDetail : OrderDetailType){
        const date = new Date();
        this._id = orderDetail._id;
        this.productName = orderDetail.productName;
        this.quantity = orderDetail.quantity;
        this.price = orderDetail.price;
        this.image = orderDetail.image;
        this.orderId = orderDetail.orderId;
    }
}