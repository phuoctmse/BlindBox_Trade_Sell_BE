const USER_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  USERNAME_IS_REQUIRED: 'Username is required',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_20: 'Username length must be from 1 to 20',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  PHONE_NUMBER_IS_REQUIRED: 'Phone number is required',
  PHONE_NUMBER_MUST_BE_A_STRING: 'Phone number must be a string',
  PHONE_NUMBER_IS_INVALID: 'Phone number is invalid',
  PHONE_NUMBER_LENGTH_MUST_BE_FROM_10_TO_15: 'Phone number length must be from 10 to 15',
  USER_NOT_FOUND: 'User not found',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout success',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFIED_SUCCESS: 'Email verified success',
  EMAIL_VERIFY_RESENT_SUCCESS: 'Email verify resent success',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  CHECK_EMAIL_FOR_RESET_PASSWORD: 'Check email for reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Forgot password token is required',
  EMAIL_NOT_FOUND: 'Email not found',
  FORGOT_PASSWORD_EMAIL_SENT: 'Forgot password email sent',
  VALID_FORGOT_PASSWORD_TOKEN: 'Valid forgot password token',
  PASSWORD_RESET_SUCCESS: 'Password reset successully',
  GET_ME_SUCCESS: 'Get my profile success',
  FULL_NAME_MUST_BE_A_STRING: 'Full name must be a string',
  FULL_NAME_LENGTH_MUST_BE_FROM_1_TO_50: 'Full name length must be from 1 to 50',
  ADDRESS_MUST_BE_A_STRING: 'Address must be a string',
  ADDRESS_LENGTH_MUST_BE_FROM_10_TO_255: 'Address length must be from 10 to 255',
  IMAGE_MUST_BE_A_STRING: 'Image must be a string',
  IMAGE_LENGTH_MUST_BE_FROM_1_TO_400: 'Image length must be from 1 to 400',
  UPDATE_ME_SUCCESS:  'Update me success',
} as const

export default USER_MESSAGES
