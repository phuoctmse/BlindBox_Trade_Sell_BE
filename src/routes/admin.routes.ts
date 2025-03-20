import { Router } from 'express'
import {
  createBeadsController,
  deleteBeadsController,
  getAllAccountsController,
  getAllBeadsController,
  getAllProductController,
  getBeadsDetailsController,
  updateAccountVerifyStatusController,
  updateBeadsController,
  updateBlindboxStatusController
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
adminRouter.post(
  '/beads',
  accessTokenValidation,
  adminValidation,
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

export default adminRouter
