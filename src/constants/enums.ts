export enum AccountVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum AccountRole {
  Admin,
  User
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerificationToken
}

export enum Category {
  Blindbox,
  Accessory,
  OpenedItems
}

export enum ProductStatus {
  Inactive,
  Active,
  Outstock
}

export enum RarityLevel {
  Common,
  Rare,
  Epic,
  Legendary
}

export enum OrderStatus {
  Pending,
  Confirmed,
  Processing,
  Completed,
  Cancelled
}

export enum PaymentMethod {
  COD,
  Banking
}

export enum PaymentStatus {
  Pending,
  Success,
  Cancelled
}

export enum OrderType {
  Direct,
  Cart
}

export enum TypeBeads {
  Low,
  Spike,
  Solid
}

export enum TradeStatus {
  Processing,
  Sent, //Sent to Admin
  Approved, //Admin
  Cancelled, //Admin
  Countered,
  Accepted,
  Rejected,
  Completed
}
