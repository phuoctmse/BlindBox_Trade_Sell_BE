import databaseServices from "./database.services";
import { ObjectId } from 'mongodb'
import { AccountVerifyStatus, Category } from '~/constants/enums'
import { PRODUCT_MESSAGES } from "~/constants/messages";

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

    async getAllBlindboxes() {
        const result = await databaseServices.products.find({ category: Category.Blindbox }).toArray();
        const formattedResult = result.map((product) => ({
            ...product,
            _id: product._id.toString()
          }))
        return {
            message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
            result: formattedResult,
        };
    }
}

const adminService = new AdminService()
export default adminService