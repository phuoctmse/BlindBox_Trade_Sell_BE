import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface RegisterReqBody {
  userName: string
  email: string
  password: string
  phoneNumber: string
}
