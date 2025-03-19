import { Router } from 'express'
import {
  createBeadsController,
  deleteBeadsController,
  getAllAccountsController,
  getAllBeadsController,
  getAllProductController,
  getAllTradePostsController,
  getBeadsDetailsController,
  updateAccountVerifyStatusController,
  updateBeadsController,
  updateBlindboxStatusController,
  UpdateTradePostStatusController
} from '~/controllers/admin.controllers'
import { accessTokenValidation, adminValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const adminRouter = Router()

// //Handle accessories
// adminRouter.get('/accessories', accessTokenValidation, adminValidation)
// adminRouter.post('/accessories', accessTokenValidation, adminValidation)

adminRouter.get('/beads', accessTokenValidation, adminValidation, wrapRequestHandler(getAllBeadsController))
adminRouter.post('/beads', accessTokenValidation, adminValidation, wrapRequestHandler(createBeadsController))
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
  '/blind-boxes/:slug',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(updateBlindboxStatusController)
)

adminRouter.get('/trade-post', accessTokenValidation, adminValidation, wrapRequestHandler(getAllTradePostsController))
adminRouter.patch(
  '/trade-post/:id',
  accessTokenValidation,
  adminValidation,
  wrapRequestHandler(UpdateTradePostStatusController)
)

export default adminRouter
