import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import {
  ForgotPasswordRequest,
  ResetPasswordConfirmRequest,
  VerifyResetPasswordTokenRequest,
} from "../types/auth.types";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
  });
};
export const useResetPasswordConfirm = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordConfirmRequest) =>
      authService.passwordResetConfirm(data),
  });
};
export const useVerifyForgotPasswordToken = () => {
  return useMutation({
    mutationFn: (data: VerifyResetPasswordTokenRequest) =>
      authService.verifyForgotPasswordToken(data),
  });
};
