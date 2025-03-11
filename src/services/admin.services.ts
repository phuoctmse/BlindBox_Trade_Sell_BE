import databaseServices from "./database.services";
import { ObjectId } from 'mongodb'
import { AccountVerifyStatus, Category, ProductStatus } from '~/constants/enums'
import { PRODUCT_MESSAGES } from "~/constants/messages";
import { CreateBeadsReqBody } from "~/models/requests/Product.request";
import Beads from "~/models/schemas/Bead.schema";

class AdminService {
    async getAllAccounts() {
        const result = await databaseServices.accounts.find().toArray();
        return {
            message: "Accounts fetched successfully",
            result,
        };
    }

    async updateAccountVerifyStatus(accountId: string, verifyStatus: AccountVerifyStatus) {
        const result = await databaseServices.accounts.updateOne(
            { _id: new ObjectId(accountId) },
            { $set: { verify: verifyStatus } }
        );
        return {
            message: "Account verification status updated successfully",
            result,
        };
    }

    async updateBlindboxStatus(slug: string, id: string, status?: ProductStatus) {
        const result = await databaseServices.products.updateOne(
            {
                slug,
                _id: new ObjectId(id)
            },
            { $set: { status } }
        );
        return {
            message: PRODUCT_MESSAGES.PRODUCT_UPDATED_SUCCESS,
            result,
        };
    }

    async createBead(payload: CreateBeadsReqBody) {
        const newBeadId = new ObjectId()
        const result = await databaseServices.beads.insertOne(
            new Beads({
                ...payload,
                _id: newBeadId,
            })
        )
        return {
            message: PRODUCT_MESSAGES.BEAD_CREATED_SUCCESS
        }
    }

    async getAllBeads() {
        const result = await databaseServices.beads.find().toArray();
        return {
            message: PRODUCT_MESSAGES.BEAD_FETCHED_SUCCESS,
            result,
        };
    }

    async getBeadsDetails(id: string) {
        const result = await databaseServices.beads.findOne({
            _id: new ObjectId(id)
        })
        return {
            message: PRODUCT_MESSAGES.BEAD_FETCHED_SUCCESS,
            result
        }
    }
}

const adminService = new AdminService()
export default adminService