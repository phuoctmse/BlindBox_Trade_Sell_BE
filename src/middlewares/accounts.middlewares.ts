import { checkSchema, ParamSchema } from 'express-validator'
import USER_MESSAGES from '~/constants/messages'
import accountService from '~/services/accounts.services'
import databaseServices from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
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
            if(account === null) {
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
