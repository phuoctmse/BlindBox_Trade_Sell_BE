import { Request, Response, NextFunction } from 'express';

export const wrapRequestHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
};
