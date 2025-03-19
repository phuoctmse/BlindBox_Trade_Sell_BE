import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import {USER_MESSAGES} from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'

type FilterKeys<T> = Array<keyof T>

export const filterMiddleware =
  <T>(filterKey: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKey)
    if (Object.keys(req.body).length === 0) {
      return next(
        new ErrorWithStatus({
          message: USER_MESSAGES.VALIDATION_ERROR,
          status: HTTP_STATUS.BAD_REQUEST
        })
      )
    }
    next()
  }
