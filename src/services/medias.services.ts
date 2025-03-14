import { NextFunction, Request, Response } from 'express'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { config } from 'dotenv'
import { uploadFileToS3 } from '~/utils/s3'
import mime from 'mime'
config()

class MediasService {
  async uploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newFullFileName = `${newName}.png`
    const newPath = path.resolve(UPLOAD_DIR, newFullFileName)
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath)
    const s3result = await uploadFileToS3({
      fileName: newFullFileName,
      filePath: newPath,
      contentType: mime.getType(newFullFileName) as string
    })
    await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

    return s3result.Location as string
  }
}

const mediasService = new MediasService()
export default mediasService
