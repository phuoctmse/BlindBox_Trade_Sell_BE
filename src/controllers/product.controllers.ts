import { Request, Response } from 'express'

export const getAllProductsController = async (req: Request, res: Response) => {
  res.json({
    message: 'Get all products'
  })
}
