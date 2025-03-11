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
  UPDATE_ME_SUCCESS: 'Update me success',
  LOGIN_OAUTH_FAILED: 'Login oauth failed',
  OLD_PASSWORD_IS_REQUIRED: 'Old password is required',
  OLD_PASSWORD_MUST_BE_A_STRING: 'Old password must be a string',
  OLD_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Old password length must be from 6 to 50',
  INVALID_CURRENT_PASSWORD: 'Invalid current password',
  NEW_PASSWORD_IS_REQUIRED: 'New password is required',
  NEW_PASSWORD_MUST_BE_A_STRING: 'New password must be a string',
  NEW_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'New password length must be from 6 to 50',
  CONFIRM_NEW_PASSWORD_IS_REQUIRED: 'Confirm new password is required',
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  PASSWORD_CHANGE_SUCCESS: 'Password change success',
  NEW_PASSWORD_SAME_AS_OLD_PASSWORD: 'New password cannot be the same as the old password.',
  UPDATE_SUCCESS: 'Update success',
  USER_NOT_SELLER: 'User is not a seller',
  REGISTERED_SELLING_SUCCESS: 'Registered selling success',
  USER_NOT_ADMIN: 'User is not admin'
} as const

const PRODUCT_MESSAGES = {
  NAME_MUST_BE_FROM_10_TO_255: 'Name must be between 10 and 255 characters',
  PRODUCT_CREATED_SUCCESS: 'Product created successfully',
  DESCRIPTION_MUST_BE_FROM_10_TO_255: 'Description must be between 10 and 255 characters',
  QUANTITY_MUST_BE_A_POSITIVE_INTEGER: 'Quantity must be a positive integer',
  PRICE_MUST_BE_A_POSITIVE_NUMBER: 'Price must be a positive number',
  BRAND_MUST_BE_FROM_1_TO_100: 'Brand must be between 1 and 100 characters',
  SIZE_MUST_BE_POSITIVE_NUMBER: 'Size must be a positive number',
  PRODUCTS_FETCHED_SUCCESS: 'Products fetched successfully',
  PRODUCT_ID_REQUIRED: 'Product ID is required',
  PRODUCT_UPDATED_SUCCESS: 'Product updated successfully',
  PRODUCT_DELETED_SUCCESS: 'Product deleted successfully',
  PRODUCT_NOT_FOUND: 'Product not found',
  INVALID_PRODUCT_ID: 'Invalid product ID',
  INVALID_PAYLOAD: 'Invalid payload',
  IMAGE_MUST_BE_A_STRING: 'Image must be a string',
  IMAGE_LENGTH_MUST_BE_FROM_1_TO_100: 'Image length must be from 1 to 100',
  COLOR_MUST_BE_A_STRING: 'Color must be a string',
  COLOR_LENGTH_MUST_BE_FROM_1_TO_100: 'Color length must be from 1 to 100',
  TYPE_MUST_BE_A_STRING: 'Type must be a string',
  TYPE_LENGTH_MUST_BE_FROM_1_TO_100: 'Type length must be from 1 to 100',
  BEAD_CREATED_SUCCESS: 'Bead created successfully',
  BEAD_FETCHED_SUCCESS: 'Bead fetched successfully',
  BEAD_UPDATED_SUCCESS: 'Bead updated successfully',
  BEAD_DELETED_SUCCESS: 'Bead deleted successfully',
  BEAD_LINKED_WITH_PRODUCT: 'Bead linked with product',
} as const

export { USER_MESSAGES, PRODUCT_MESSAGES }
