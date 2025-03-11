import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import { result } from 'lodash'
import path from 'path'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.uploadSingleImage(req)
  res.json({ result })
  return
}
