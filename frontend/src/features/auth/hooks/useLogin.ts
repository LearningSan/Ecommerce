"use client";

import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";
import type { LoginRequest } from "../types/auth.types";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
  });
};
