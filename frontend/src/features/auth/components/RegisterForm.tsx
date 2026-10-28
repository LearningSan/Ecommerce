"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  LockKeyhole,
  User,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schema";
import { useRegister } from "../hooks/useRegister";
import axios from "axios";
import { ApiErrorResponse } from "@/shared/types/api";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { email: "", phone: "", name: "", password: "" },
  });

  const password = watch("password") || "";

  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthScore = Object.values(passwordCriteria).filter(Boolean).length;

  const getStrengthText = () => {
    if (password.length === 0) return "";
    if (strengthScore <= 2) return "Yếu";
    if (strengthScore <= 4) return "Trung bình";
    return "Mạnh cực kỳ 🔥";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    await registerMutation.mutateAsync(data, {
      onSuccess: () => {
        router.replace(
          `/wait-verify-email?email=${encodeURIComponent(data.email)}`,
        );
      },
    });
  };

  // Tự động cuộn ra giữa màn hình khi vào trang, tránh header che khuất
  useEffect(() => {
    document.getElementById("register-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Các đốm sáng trang trí nền phía sau giúp form nổi bật, không bị "tàng hình" */}
      <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      {/* Thêm id="register-form" và scroll-mt-24 để hỗ trợ cuộn chuẩn */}
      <div
        id="register-form"
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/10 dark:border-gray-800/50 dark:bg-gray-900/80 scroll-mt-24"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Tạo tài khoản mới ✨
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vui lòng điền thông tin bên dưới để đăng ký
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                placeholder="nhanvien@example.com"
                className={`w-full rounded-xl border bg-white/90 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
                }`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Số điện thoại
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="phone"
                placeholder="0912345678"
                className={`w-full rounded-xl border bg-white/90 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                  errors.phone
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
                }`}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Name field */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Họ và tên
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                placeholder="Nguyễn Văn A"
                className={`w-full rounded-xl border bg-white/90 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
                }`}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <LockKeyhole className="absolute left-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white/90 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-3 p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/60 dark:border-gray-700/60 text-sm">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                      Độ bảo vệ:
                    </span>
                    <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthScore > 3
                          ? "bg-emerald-500"
                          : strengthScore > 1
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                      style={{
                        width: `${(strengthScore / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  {[
                    { label: "Ít nhất 8 ký tự", met: passwordCriteria.length },
                    {
                      label: "Chữ cái viết HOA",
                      met: passwordCriteria.uppercase,
                    },
                    {
                      label: "Chữ cái viết thường",
                      met: passwordCriteria.lowercase,
                    },
                    { label: "Chữ số (0-9)", met: passwordCriteria.number },
                    { label: "Ký tự đặc biệt", met: passwordCriteria.special },
                  ].map((criterion, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                        criterion.met
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                          criterion.met
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                        }`}
                      >
                        {criterion.met ? "✓" : "✕"}
                      </span>
                      <span>{criterion.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Server side error banner */}
          {registerMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-center text-xs font-medium text-red-600 backdrop-blur-sm dark:border-red-900/30 dark:bg-red-950/40 dark:text-red-400">
              {axios.isAxiosError<ApiErrorResponse>(registerMutation.error)
                ? registerMutation.error?.response?.data.message
                : "Đăng ký không thành công. Vui lòng thử lại."}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              <span>Đăng ký</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
