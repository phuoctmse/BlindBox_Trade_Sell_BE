import { Router } from 'express'
import { createBeadsController, deleteBeadsController, getAllAccountsController, getAllBeadsController, getBeadsDetailsController, updateAccountVerifyStatusController, updateBeadsController, updateBlindboxStatusController } from '~/controllers/admin.controllers'
import { getALlBlindBoxesController } from '~/controllers/product.controllers'
import { accessTokenValidation, adminValidation } from '~/middlewares/accounts.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createBeadsValidation } from '~/middlewares/products.middleware'
import { CreateBeadsReqBody } from '~/models/requests/Product.request'
import { wrapRequestHandler } from '~/utils/handlers'

const adminRouter = Router()

// //Handle accessories
// adminRouter.get('/accessories', accessTokenValidation, adminValidation)
// adminRouter.post('/accessories', accessTokenValidation, adminValidation)


adminRouter.get('/beads', accessTokenValidation, adminValidation, wrapRequestHandler(getAllBeadsController))
adminRouter.post('/beads', accessTokenValidation, adminValidation,  createBeadsValidation, filterMiddleware<CreateBeadsReqBody>(['color', 'price', 'type']), wrapRequestHandler(createBeadsController))
adminRouter.get('/beads/:id', accessTokenValidation, adminValidation, wrapRequestHandler(getBeadsDetailsController))
adminRouter.put('/beads/:id', accessTokenValidation, adminValidation, filterMiddleware<CreateBeadsReqBody>(['color', 'price', 'type']), wrapRequestHandler(updateBeadsController))
adminRouter.delete('/beads/:id', accessTokenValidation, adminValidation, wrapRequestHandler(deleteBeadsController))

//Handle account and product status
adminRouter.get('/accounts', accessTokenValidation, adminValidation, wrapRequestHandler(getAllAccountsController))
adminRouter.put('/accounts/:accountId', accessTokenValidation, adminValidation, wrapRequestHandler(updateAccountVerifyStatusController))
adminRouter.get('/blind-boxes', accessTokenValidation, adminValidation, wrapRequestHandler(getALlBlindBoxesController))
adminRouter.put('/blind-boxes/:slug', accessTokenValidation, adminValidation, wrapRequestHandler(updateBlindboxStatusController))

export default adminRouter
