import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import {
  socketAuthMiddleware,
  socketVerifiedMiddleware,
  socketSellerMiddleware
} from '../middlewares/socket.middlewares'
import { SOCKET_EVENTS } from '~/constants/sockets'

// Map để lưu trữ kết nối socket cho từng người dùng
const userSockets = new Map<string, Socket>()

// Map để lưu trữ kết nối socket cho các seller
const sellerSockets = new Map<string, Socket>()

export const initSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  })

  // Global middleware - Authentication
  io.use(socketAuthMiddleware)

  // Socket cho tất cả người dùng đã đăng nhập
  const userNamespace = io.of('/user')
  userNamespace.use(socketAuthMiddleware)
  userNamespace.on('connection', (socket) => {
    const { accountId } = socket.data
    console.log(`User connected: ${socket.id}, account: ${accountId}`)

    // Lưu socket vào map
    if (accountId) {
      userSockets.set(accountId, socket)
    }

    // Đăng ký các event listeners
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.id}`)
      if (accountId) {
        userSockets.delete(accountId)
      }
    })

    // Thông báo kết nối thành công
    socket.emit(SOCKET_EVENTS.CONNECT_SUCCESS, {
      message: 'Connected to user namespace successfully'
    })
  })

  // Socket cho người dùng đã verified email
  const verifiedNamespace = io.of('/verified')
  verifiedNamespace.use(socketAuthMiddleware)
  verifiedNamespace.use(socketVerifiedMiddleware)
  verifiedNamespace.on('connection', (socket) => {
    console.log(`Verified user connected: ${socket.id}`)

    // Thông báo kết nối thành công
    socket.emit(SOCKET_EVENTS.CONNECT_SUCCESS, {
      message: 'Connected to verified namespace successfully'
    })
  })

  // Socket cho seller
  const sellerNamespace = io.of('/seller')
  sellerNamespace.use(socketAuthMiddleware)
  sellerNamespace.use(socketSellerMiddleware)
  sellerNamespace.on('connection', (socket) => {
    const { accountId } = socket.data
    console.log(`Seller connected: ${socket.id}, account: ${accountId}`)

    // Lưu socket vào map seller
    if (accountId) {
      sellerSockets.set(accountId, socket)
    }

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`Seller disconnected: ${socket.id}`)
      if (accountId) {
        sellerSockets.delete(accountId)
      }
    })

    // Thông báo kết nối thành công
    socket.emit(SOCKET_EVENTS.CONNECT_SUCCESS, {
      message: 'Connected to seller namespace successfully'
    })
  })

  return io
}

/**
 * Gửi thông báo email đã xác thực cho người dùng
 */
export const notifyEmailVerified = (accountId: string) => {
  const socket = userSockets.get(accountId)
  if (socket) {
    socket.emit(SOCKET_EVENTS.EMAIL_VERIFIED, {
      message: 'Your email has been verified successfully',
      timestamp: new Date()
    })
  }
}

/**
 * Gửi thông báo đăng ký seller thành công
 */
export const notifySellerRegistered = (accountId: string) => {
  const socket = userSockets.get(accountId)
  if (socket) {
    socket.emit(SOCKET_EVENTS.SELLER_REGISTERED, {
      message: 'You have successfully registered as a seller',
      timestamp: new Date()
    })
  }
}

export const notifyBuyerOrderSuccess = (accountId: string) => {
  const socket = userSockets.get(accountId)
  if (socket) {
    socket.emit(SOCKET_EVENTS.ORDER_SUCCESS, {
      message: 'You have successfully order',
      timestamp: new Date()
    })
  }
}
