import { Router } from 'express'
import { wrap } from 'lodash'
import adminController from '~/controllers/admin.controllers'
import productController from '~/controllers/product.controllers'
import { accessTokenValidation, adminValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { CreditConversion } from '~/models/requests/Admin.requests'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const adminRouter = Router()

// //Handle accessories
// adminRouter.get('/accessories', accessTokenValidation, adminValidation)
// adminRouter.post('/accessories', accessTokenValidation, adminValidation)

adminRouter.get('/beads', accessTokenValidation, adminValidation, wrapRequestHandler(adminController.getAllBeads))
adminRouter.post(
  '/beads',
  accessTokenValidation,
  adminValidation,
  filterMiddleware<CreateBeadsReqBody>(['price', 'type']),
  wrapRequestHandler(adminController.createBeads)
)
adminRouter.get(
  '/beads/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.getBeadsDetails)
)
adminRouter.put(
  '/beads/:id',
  accessTokenValidation,
  adminValidation,
  filterMiddleware<CreateBeadsReqBody>(['price', 'type']),
  wrapRequestHandler(adminController.updateBeads)
)
adminRouter.delete(
  '/beads/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.deleteBeads)
)

//Handle account and product status
adminRouter.get('/accounts', accessTokenValidation, adminValidation, wrapRequestHandler(adminController.getAllAccounts))
adminRouter.put(
  '/accounts/:accountId',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.updateAccountVerifyStatus)
)
adminRouter.delete(
  '/accounts/:accountId',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.deleteAccount)
)
adminRouter.get('/products', accessTokenValidation, adminValidation, wrapRequestHandler(adminController.getAllProduct))
adminRouter.put(
  '/products/:slug',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.updateBlindboxStatus)
)
adminRouter.delete(
  '/products/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.deleteProduct)
)
adminRouter.get(
  '/feedbacks',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.getAllFeedback)
)
adminRouter.delete(
  '/feedbacks/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.deleteFeedback)
)

adminRouter.get(
  '/promotions',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(productController.getAllPromotions)
)
adminRouter.post(
  '/promotions',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(productController.createPromotion)
)
adminRouter.put(
  '/promotion/:promotionId',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(productController.editPromotion)
)
adminRouter.delete(
  '/promotion/:promotionId',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(productController.deletePromotion)
)

adminRouter.get(
  '/trade-post',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.getAllTradePosts)
)
adminRouter.patch(
  '/trade-post/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.updateTradePostStatus)
)

adminRouter.get(
  '/trade-post/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.getTradePostsDetails)
)

adminRouter.get(
  '/credit-conversion',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.getCreditConversion)
)

adminRouter.patch(
  '/credit-conversion',
  accessTokenValidation,
  adminValidation,
  filterMiddleware<CreditConversion>(['chargedCredit', 'rate']),
  wrapRequestHandler(adminController.updateCreditConversion)
)

adminRouter.get(
  '/dashboard/stats',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(adminController.getDashboardStats)
)

export default adminRouter
