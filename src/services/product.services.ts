import { ObjectId } from 'mongodb'
import slugify from 'slugify'
import databaseServices from './database.services'
import { CreateBlindBoxesReqBody } from '~/models/requests/Product.request'
import { Category } from '~/constants/enums'
import Products from '~/models/schemas/Product.schema'
import { PRODUCT_MESSAGES } from '~/constants/messages'

class ProductService {
  async getMyBlindBoxes(accountId: string) {
    const result = await databaseServices.products
      .find({
        category: Category.Blindbox,
        createdBy: new ObjectId(accountId)
      })
      .project({
        _id: 1,
        name: 1
      })
      .toArray()

    const formattedResult = result.map((product) => ({
      ...product,
      _id: product._id.toString()
    }))
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: formattedResult
    }
  }

  async createBlindBoxes(payload: CreateBlindBoxesReqBody, accountId: string) {
    const newProductId = new ObjectId()
    const slug = slugify(payload.name, { lower: true, strict: true })
    const result = await databaseServices.products.insertOne(
      new Products({
        ...payload,
        _id: newProductId,
        createdBy: new ObjectId(accountId),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: Category.Blindbox,
        blindBoxes: {
          size: payload.size
        },
        slug
      })
    )
    return {
      message: PRODUCT_MESSAGES.PRODUCT_CREATED_SUCCESS
    }
  }

  async getBlindBoxesDetails(slug: string, id: string) {
    const result = await databaseServices.products.findOne({
      slug,
      _id: new ObjectId(id)
    })
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result
    }
  }

  async getAllBlindBoxes() {
    const result = await databaseServices.products
      .find({
        category: Category.Blindbox
      })
      // .project({
      //   _id: 1,
      //   name: 1
      // })
      .toArray()

    const formattedResult = result.map((product) => ({
      ...product,
      _id: product._id.toString()
    }))
    return {
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED_SUCCESS,
      result: formattedResult
    }
  }

  async updateProduct(id: string, payload: any) {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: "Invalid product ID" };
    }

    if (!payload || typeof payload !== 'object') {
      return { success: false, message: "Invalid payload" };
    }

    console.log('Updating product with ID:', id);
    console.log('Payload:', payload);

    const updatePayload: any = {
      ...payload,
      updatedAt: new Date()
    };

    if (payload.size) {
      updatePayload['blindBoxes.size'] = payload.size;
      delete updatePayload.size;
    }

    try {
      const result = await databaseServices.products.updateOne(
        { _id: new ObjectId(id) },  // Ensure ID is a valid ObjectId
        { $set: updatePayload }
      );

      if (result.matchedCount === 0) {
        return { success: false, message: "Product not found" };
      }

      return { success: true, message: "Product updated successfully" };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, message: "Error updating product" };
    }
  }

  async deleteProduct(id: string) {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: "Invalid product ID" };
    }

    try {
      const objectId = new ObjectId(id);
      console.log('Deleting product with ID:', objectId);

      const result = await databaseServices.products.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        console.log('Product not found:', objectId);
        return { success: false, message: "Product not found" };
      }

      console.log('Product deleted successfully:', objectId);
      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, message: "Error deleting product" };
    }
}

}
const productService = new ProductService()
export default productService
