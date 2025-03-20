import { Router } from 'express'
import {
  createBeadsController,
  deleteBeadsController,
  deleteFeedbackController,
  getAllAccountsController,
  getAllBeadsController,
  getAllFeedbackController,
  getAllProductController,
  getAllTradePostsController,
  getBeadsDetailsController,
  getCreditConversionController,
  getTradePostsDetailsController,
  updateAccountVerifyStatusController,
  updateBeadsController,
  updateBlindboxStatusController,
  updateCreditConversionController,
  UpdateTradePostStatusController
} from '~/controllers/admin.controllers'
import { accessTokenValidation, adminValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { CreditConversion } from '~/models/requests/Admin.requests'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const adminRouter = Router()

// //Handle accessories
// adminRouter.get('/accessories', accessTokenValidation, adminValidation)
// adminRouter.post('/accessories', accessTokenValidation, adminValidation)

adminRouter.get('/beads', accessTokenValidation, adminValidation, wrapRequestHandler(getAllBeadsController))
adminRouter.post(
  '/beads',
  accessTokenValidation,
  adminValidation,
  filterMiddleware<CreateBeadsReqBody>(['price', 'type']),
  wrapRequestHandler(createBeadsController)
)
adminRouter.get('/beads/:id', accessTokenValidation, adminValidation, wrapRequestHandler(getBeadsDetailsController))
adminRouter.put(
  '/beads/:id',
  accessTokenValidation,
  adminValidation,
  filterMiddleware<CreateBeadsReqBody>(['price', 'type']),
  wrapRequestHandler(updateBeadsController)
)
adminRouter.delete('/beads/:id', accessTokenValidation, adminValidation, wrapRequestHandler(deleteBeadsController))

//Handle account and product status
adminRouter.get('/accounts', accessTokenValidation, adminValidation, wrapRequestHandler(getAllAccountsController))
adminRouter.put(
  '/accounts/:accountId',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(updateAccountVerifyStatusController)
)
adminRouter.get('/products', accessTokenValidation, adminValidation, wrapRequestHandler(getAllProductController))
adminRouter.put(
  '/products/:slug',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(updateBlindboxStatusController)
)
adminRouter.get('/feedbacks', accessTokenValidation, adminValidation, wrapRequestHandler(getAllFeedbackController))
adminRouter.delete('/feedbacks/:id', accessTokenValidation, adminValidation, wrapRequestHandler(deleteFeedbackController))

adminRouter.get('/trade-post', accessTokenValidation, adminValidation, wrapRequestHandler(getAllTradePostsController))
adminRouter.patch(
  '/trade-post/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(UpdateTradePostStatusController)
)

adminRouter.get(
  '/trade-post/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(getTradePostsDetailsController)
)

adminRouter.get(
  'credit-conversion',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(getCreditConversionController)
)

adminRouter.patch(
  'credit-conversion',
  accessTokenValidation,
  adminValidation,
  filterMiddleware<CreditConversion>(['chargedCredit', 'rate']),
  wrapRequestHandler(updateCreditConversionController)
)

export default adminRouter
