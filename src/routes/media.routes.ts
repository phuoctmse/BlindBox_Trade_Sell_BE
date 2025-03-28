import { Router } from 'express'
import mediaController from '~/controllers/media.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(mediaController.uploadSingleImage))

export default mediasRouter
