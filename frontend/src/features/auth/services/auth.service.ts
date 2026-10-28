import api from "@/lib/axios";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResendEmailVeriyResponse,
  ResendEmailVeriyRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  VerifyResetPasswordTokenRequest,
  VerifyResetPasswordTokenResponse,
  ResetPasswordConfirmRequest,
  ResetPasswordConfirmResponse,
} from "../types/auth.types";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/user/login", data);

    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(
      "/auth/user/register",
      data,
    );

    return response.data;
  },
  resendVerifyEmail: async (
    data: ResendEmailVeriyRequest,
  ): Promise<ResendEmailVeriyResponse> => {
    const response = await api.post<ResendEmailVeriyResponse>(
      "/auth/user/resend-verify-email",
      data,
    );
    return response.data;
  },
  verifyEmail: async (
    data: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> => {
    const response = await api.post<VerifyEmailResponse>(
      "/auth/user/verify-email",
      data,
    );
    return response.data;
  },
  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>(
      "/password-reset/request",
      data,
    );
    return response.data;
  },
  verifyForgotPasswordToken: async (
    data: VerifyResetPasswordTokenRequest,
  ): Promise<VerifyResetPasswordTokenResponse> => {
    const response = await api.get<VerifyResetPasswordTokenResponse>(
      "/password-reset/verify",
      {
        params: data,
      },
    );

    return response.data;
  },
  passwordResetConfirm: async (
    data: ResetPasswordConfirmRequest,
  ): Promise<ResetPasswordConfirmResponse> => {
    const response = await api.post<ResetPasswordConfirmResponse>(
      "/password-reset/confirm",
      data,
    );
    return response.data;
  },
};
