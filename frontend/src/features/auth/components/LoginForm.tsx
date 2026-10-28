"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useLogin";
import { useAuthStore } from "@/stores/auth.store";
import axios from "axios";
import { ApiErrorResponse } from "@/shared/types/api";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const markAuthSession = useAuthStore((state) => state.markAuthSession);

  const onSubmit = (data: LoginFormValues) => {
    console.log("[LOGIN] Submit:", data.identifier);

    loginMutation.mutate(data, {
      onSuccess: (result) => {
        console.log("[LOGIN] Success:", result);

        setUser(result.user);
        setAccessToken(result.accessToken);
        markAuthSession();

        console.log("[LOGIN] Zustand:", useAuthStore.getState());

        router.push("/");
      },

      onError: (error) => {
        console.error("[LOGIN] Error:", error);
      },
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/user/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/user/facebook`;
  };
  useEffect(() => {
    document.getElementById("login-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center", // Thay "start" thành "center"
    });
  }, []);
  return (
    <div id="login-form" className="w-full max-w-md rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/10 dark:border-gray-800/50 dark:bg-gray-900/70">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Chào mừng bạn 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vui lòng nhập thông tin để đăng nhập vào hệ thống.
        </p>
      </div>

      {loginMutation.isError && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-600 backdrop-blur-sm dark:border-red-900/30 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            {axios.isAxiosError<ApiErrorResponse>(loginMutation.error)
              ? loginMutation.error.response?.data?.message
              : "Đã xảy ra lỗi"}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="identifier"
            className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Email hoặc Số điện thoại
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="identifier"
              type="text"
              placeholder="name@example.com"
              {...register("identifier")}
              className={`w-full rounded-xl border bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                errors.identifier
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
              }`}
            />
          </div>
          {errors.identifier && (
            <p className="text-xs font-medium text-red-500">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-xl border bg-white/80 py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                errors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loginMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang xác thực...
            </span>
          ) : (
            <span>Đăng nhập</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
          HOẶC
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="group relative flex items-center justify-center gap-2.5 rounded-xl border border-gray-200/80 bg-white/60 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-md hover:shadow-gray-200/50 active:translate-y-0 active:scale-[0.97] dark:border-gray-700/80 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:shadow-black/40"
        >
          <svg
            className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.42Z"
            />
            <path
              fill="#34A853"
              d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.6Z"
            />
            <path
              fill="#FBBC05"
              d="M6.54 13.69A5.84 5.84 0 0 1 6.23 12c0-.59.1-1.16.31-1.69V7.79H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.21l3.24-2.52Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.27c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.26 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.04 5.46-4.04Z"
            />
          </svg>
          <span>Google</span>
        </button>

        {/* Facebook Button */}
        <button
          type="button"
          onClick={handleFacebookLogin}
          className="group relative flex items-center justify-center gap-2.5 rounded-xl border border-gray-200/80 bg-white/60 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-600 hover:shadow-md hover:shadow-blue-500/10 active:translate-y-0 active:scale-[0.97] dark:border-gray-700/80 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-blue-900/50 dark:hover:bg-gray-800 dark:hover:text-blue-400 dark:hover:shadow-black/40"
        >
          <svg
            className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#1877F2"
              d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.16 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.16 24 18.1 24 12.07Z"
            />
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
