import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/media.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediasRouter
