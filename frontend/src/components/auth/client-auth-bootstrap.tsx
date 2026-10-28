"use client";

import { useEffect } from "react";
import axios from "axios";

import { refreshAccessToken } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";

const AUTH_SESSION_KEY =
  process.env.NEXT_PUBLIC_AUTH_SESSION_KEY || "has_auth_session";

export function ClientAuthBootstrap() {
  useEffect(() => {
    const bootstrap = async () => {
      const authStore = useAuthStore.getState();

      if (authStore.accessToken) {
        authStore.setAuthStatus("authenticated");
        return;
      }

      // Chưa từng đăng nhập hoặc đã đăng xuất:
      // Không gọi API refresh cho khách vãng lai.
      const hasAuthSession = localStorage.getItem(AUTH_SESSION_KEY) === "true";

      if (!hasAuthSession) {
        authStore.setAuthStatus("guest");
        return;
      }

      try {
        await refreshAccessToken();
        useAuthStore.getState().setAuthStatus("authenticated");
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          // Session không còn hợp lệ.
          useAuthStore.getState().clearAuth();
          return;
        }

        // Lỗi mạng/server không đồng nghĩa với việc đã đăng xuất.
        console.error("BOOTSTRAP REFRESH ERROR:", error);
      }
    };

    void bootstrap();
  }, []);

  return null;
}
