import { Socket } from 'socket.io'
import { verifyToken } from '~/utils/jwt'
import { TokenPayload } from '~/models/requests/Account.requests'
import { AccountVerifyStatus } from '~/constants/enums'
import { USER_MESSAGES } from '~/constants/messages'

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error: Token required'))
    }

    const decoded = await verifyToken({
      token,
      secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })

    socket.data.user = decoded
    socket.data.accountId = (decoded as TokenPayload).accountId

    return next()
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'))
  }
}

export const socketVerifiedMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const user = socket.data.user as TokenPayload

    if (!user) {
      return next(new Error('Authentication error'))
    }

    if (user.verify !== AccountVerifyStatus.Verified) {
      return next(new Error(USER_MESSAGES.EMAIL_NOT_VERIFIED))
    }

    return next()
  } catch (error) {
    return next(new Error('Server error'))
  }
}

export const socketSellerMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const user = socket.data.user as TokenPayload

    if (!user) {
      return next(new Error('Authentication error'))
    }

    if (!user.isSeller) {
      return next(new Error(USER_MESSAGES.USER_NOT_SELLER))
    }

    return next()
  } catch (error) {
    return next(new Error('Server error'))
  }
}
