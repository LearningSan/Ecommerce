"use client";

import { create } from "zustand";
import type { User } from "@/features/auth/types/auth.types";

export type AuthStatus = "loading" | "authenticated" | "guest";

const AUTH_SESSION_KEY =
  process.env.NEXT_PUBLIC_AUTH_SESSION_KEY || "has_auth_session";
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;

  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  setAuthStatus: (status: AuthStatus) => void;
  markAuthSession: () => void;
  clearUser: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  authStatus: "loading",

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      authStatus: "authenticated",
    }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuthStatus: (authStatus) => set({ authStatus }),

  markAuthSession: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_SESSION_KEY, "true");
    }
  },

  clearUser: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authStatus: "guest",
    }),

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authStatus: "guest",
    });
  },
}));
