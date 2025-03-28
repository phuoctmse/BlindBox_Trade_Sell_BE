import { RequestHandler } from 'express'

export const wrapRequestHandler = (handler: RequestHandler) => {
  return async (req: any, res: any, next: any) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
