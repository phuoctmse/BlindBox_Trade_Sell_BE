import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import accountService from '~/services/accounts.services'
import databaseServices from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyAccessToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const userNameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.USERNAME_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USER_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50,
    options: {
      min: 1,
      max: 50
    }
  },
  trim: true,
  custom: {
    options: async (value) => {
      const isExistUserName = await accountService.checkUserNameExist(value)
      if (isExistUserName) {
        throw new Error(USER_MESSAGES.USERNAME_ALREADY_EXISTS)
      }
      return true
    }
  }
}

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  custom: {
    options: (value: any, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return value
    }
  }
}

const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
  },
  isEmail: {
    errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
  },
  trim: true,
  custom: {
    options: async (value) => {
      const isExistEmail = await accountService.checkEmailExist(value)
      if (isExistEmail) {
        throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
      }
      return true
    }
  }
}

const phoneNumberSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PHONE_NUMBER_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USER_MESSAGES.PHONE_NUMBER_LENGTH_MUST_BE_FROM_10_TO_15,
    options: {
      min: 10,
      max: 15
    }
  },
  isMobilePhone: {
    errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_INVALID,
    options: ['any']
  }
}

export const registerValidation = validate(
  checkSchema(
    {
      userName: userNameSchema,
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
      phoneNumber: phoneNumberSchema
    },
    ['body']
  )
)

export const loginValidation = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value, { req }) => {
            const account = await databaseServices.accounts.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (account === null) {
              throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.account = account
            return account
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const accessTokenValidation = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyAccessToken({
                token: access_token,
                secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decode_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidation = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyAccessToken({ token: value, secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseServices.refreshTokens.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decode_authorization = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidation = validate(
  checkSchema(
    {
      email_verified_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            const decoded_email_verified_token = await verifyAccessToken({
              token: value,
              secretKey: process.env.JWT_SECRET_VERIFIED_EMAIL_TOKEN as string
            })
            ;(req as Request).decoded_email_verified_token = decoded_email_verified_token

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordTokenValidation = validate(
  checkSchema(
    {
      forgot_password_token: {
        in: ['body'],
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) return true; 

            const decoded_Forgot_Password_Token = await verifyAccessToken({
              token: value,
              secretKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string,
            });

            (req as Request).decoded_forgot_password_token = decoded_Forgot_Password_Token;

            return true;
          },
        },
      },
    },
    ['body']
  )
);

export const verifyForgotPasswordTokenValidation = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new Error(USER_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED);
            }
            // Verify token
            const decoded_Forgot_Password_Token = await verifyAccessToken({
              token: value,
              secretKey: process.env.JWT_FORGOT_PASSWORD_TOKEN as string,
            });
            (req as Request).decoded_forgot_password_token = decoded_Forgot_Password_Token;

            return true;
          },
        },
      },
    },
    ['body']
  )
);

