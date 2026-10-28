import { useMutation } from "@tanstack/react-query";
import { VerifyEmailRequest } from "../types/auth.types";
import { authService } from "../services/auth.service";

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: VerifyEmailRequest) => authService.verifyEmail(data),
  });
};
