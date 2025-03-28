import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import { result } from 'lodash'
import path from 'path'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'

class MediaController {
  async uploadSingleImage(req: Request, res: Response) {
    const result = await mediasService.uploadSingleImage(req)
    res.json(result)
  }
}

const mediaController = new MediaController()
export default mediaController
