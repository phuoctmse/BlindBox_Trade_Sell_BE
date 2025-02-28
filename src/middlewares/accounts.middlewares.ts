import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { AccountVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import USER_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import accountService from '~/services/accounts.services'
import databaseServices from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const userNameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.USERNAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    errorMessage: USER_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_20,
    options: {
      min: 1,
      max: 50
    }
  },
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

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USER_MESSAGES.IMAGE_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    errorMessage: USER_MESSAGES.IMAGE_LENGTH_MUST_BE_FROM_1_TO_400
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
              const decoded_authorization = await verifyToken({
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
            const refreshToken = req.cookies?.refresh_token
            if (!refreshToken) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseServices.refreshTokens.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
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
    ['cookies']
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
            const decoded_email_verified_token = await verifyToken({
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
      email: {
        ...emailSchema,
        custom: {
          options: async (value, { req }) => {
            const account = await databaseServices.accounts.findOne({ email: value })
            if (!account) {
              throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
            }
            req.account = account
            return true
          }
        }
      }
    },
    ['body']
  )
)

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
              throw new Error(USER_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED)
            }
            // Verify token
            const decoded_Forgot_Password_Token = await verifyToken({
              token: value,
              secretKey: process.env.JWT_FORGOT_PASSWORD_TOKEN as string
            })
            ;(req as Request).decoded_forgot_password_token = decoded_Forgot_Password_Token

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidation = validate(
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
              throw new Error(USER_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED)
            }
            const decoded_Forgot_Password_Token = await verifyToken({
              token: value,
              secretKey: process.env.JWT_FORGOT_PASSWORD_TOKEN as string
            })
            ;(req as Request).decoded_forgot_password_token = decoded_Forgot_Password_Token
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: {
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
    },
    ['body']
  )
)

export const changePasswordValidation = validate(
  checkSchema({
    old_password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.OLD_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USER_MESSAGES.OLD_PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        errorMessage: USER_MESSAGES.OLD_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        options: {
          min: 6,
          max: 50
        }
      }
    },
    new_password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.NEW_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USER_MESSAGES.NEW_PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        errorMessage: USER_MESSAGES.NEW_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        options: {
          min: 6,
          max: 50
        }
      },
      custom: {
        options: (value, { req }) => {
          if (value === req.body.old_password) {
            throw new Error(USER_MESSAGES.NEW_PASSWORD_SAME_AS_OLD_PASSWORD)
          }
          return true
        }
      }
    },
    confirm_new_password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.CONFIRM_NEW_PASSWORD_IS_REQUIRED
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.new_password) {
            throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return value
        }
      }
    }
  })
)

export const verifiedUserValidation = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode_authorization as TokenPayload
  if (verify !== AccountVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    )
  }
  next()
}

export const updateMeValidation = validate(
  checkSchema({
    fullName: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.FULL_NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        errorMessage: USER_MESSAGES.FULL_NAME_LENGTH_MUST_BE_FROM_1_TO_50,
        options: {
          min: 1,
          max: 50
        }
      }
    },
    email: { ...emailSchema, optional: true },
    phonNumber: { ...phoneNumberSchema, optional: true },
    address: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.ADDRESS_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        errorMessage: USER_MESSAGES.ADDRESS_LENGTH_MUST_BE_FROM_10_TO_255,
        options: {
          min: 10,
          max: 255
        }
      }
    }
  })
)
