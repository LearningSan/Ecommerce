import { useMutation } from "@tanstack/react-query";
import { ResendEmailVeriyRequest } from "../types/auth.types";
import { authService } from "../services/auth.service";

export const useResendVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: ResendEmailVeriyRequest) =>
      authService.resendVerifyEmail(data),
  });
};
