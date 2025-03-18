export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  CONNECT_SUCCESS: 'connect_success',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  EMAIL_VERIFIED: 'email_verified',
  SELLER_REGISTERED: 'seller_registered',
}

export const SOCKET_NAMESPACES = {
  USER: '/user',
  VERIFIED: '/verified',
  SELLER: '/seller',
  ADMIN: '/admin'
}
