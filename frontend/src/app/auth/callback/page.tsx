"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuthStore } from "@/stores/auth.store";
import { User } from "@/features/auth/types/auth.types";

interface RefreshResponse {
  accessToken: string;
  user: User;
}

export default function OAuthCallbackPage() {
  const router = useRouter();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const completeLogin = async () => {
      try {
        const response = await axios.post<RefreshResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/user/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken, user } = response.data;

        if (!accessToken || !user) {
          throw new Error("Invalid authentication response");
        }

        const authStore = useAuthStore.getState();

        authStore.setUser(user as Parameters<typeof authStore.setUser>[0]);
        authStore.setAccessToken(accessToken);
        authStore.markAuthSession();
        authStore.setAuthStatus("authenticated");

        router.replace("/");
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(true);
      }
    };

    void completeLogin();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">
          Không thể hoàn tất đăng nhập. Vui lòng thử lại.
        </p>
        <button
          onClick={() => router.replace("/login")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600">Đang hoàn tất đăng nhập...</p>
    </div>
  );
}
