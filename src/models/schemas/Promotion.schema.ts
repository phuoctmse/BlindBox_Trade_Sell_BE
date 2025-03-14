import { ObjectId } from "mongodb";

interface PromotionType{
    _id : ObjectId;
    name: string;
    discountRate: number;
    startDate: Date;
    endDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    sellerId: ObjectId;
    isActive: boolean;    
}

export default class Promotions{
    _id : ObjectId;
    name: string;
    discountRate: number;
    startDate: Date;
    endDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    sellerId: ObjectId;
    isActive: boolean;

    constructor(promotion : PromotionType){
        const date = new Date();
        this._id = promotion._id;
        this.name = promotion.name;
        this.discountRate = promotion.discountRate;
        this.startDate = promotion.startDate;
        this.endDate = promotion.endDate;
        this.createdAt = promotion.createdAt || date;
        this.updatedAt = promotion.updatedAt || date;
        this.sellerId = promotion.sellerId;
        this.isActive = promotion.isActive;
    }
}