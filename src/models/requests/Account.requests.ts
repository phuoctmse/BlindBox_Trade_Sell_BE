import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface TokenPayload extends JwtPayload {
  accountId: string
  token_type: TokenType
}

export interface RegisterReqBody {
  userName: string
  email: string
  password: string
  phoneNumber: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface EmailVerifyReqBody {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string;
}
