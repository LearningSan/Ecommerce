export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}
export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}
export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ResetPasswordConfirmResponse extends ForgotPasswordResponse {}

export interface ResendEmailVeriyRequest extends ForgotPasswordRequest {}
export interface ResendEmailVeriyResponse extends ForgotPasswordResponse {}

export interface VerifyEmailRequest {
  token: string;
}
export interface VerifyEmailResponse extends ForgotPasswordResponse {}

export interface VerifyResetPasswordTokenRequest extends VerifyEmailRequest {}
export interface VerifyResetPasswordTokenResponse {
  valid: boolean;
}
