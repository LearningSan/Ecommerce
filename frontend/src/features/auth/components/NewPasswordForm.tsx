"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, KeyRound, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

import {
  newPasswordSchema,
  type NewPasswordFormData,
} from "../schemas/auth.schema";
import { useResetPasswordConfirm } from "../hooks/usePasswordReset";

interface NewPasswordFormProps {
  token: string;
}

export default function NewPasswordForm({ token }: NewPasswordFormProps) {
  const router = useRouter();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const comfirmResetPassword = useResetPasswordConfirm();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Tự động cuộn ra giữa màn hình khi vào trang, tránh header che khuất
  useEffect(() => {
    document.getElementById("new-password-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const newPasswordValue = watch("newPassword", "");

  const passwordRequirements = useMemo(() => {
    return [
      {
        id: "length",
        label: "Ít nhất 8 ký tự",
        isMet: newPasswordValue.length >= 8,
      },
      {
        id: "cases",
        label: "Gồm chữ hoa & chữ thường",
        isMet: /[a-z]/.test(newPasswordValue) && /[A-Z]/.test(newPasswordValue),
      },
      {
        id: "number",
        label: "Ít nhất 1 chữ số (0-9)",
        isMet: /\d/.test(newPasswordValue),
      },
      {
        id: "symbol",
        label: "Ít nhất 1 ký tự đặc biệt (!@#$%...)",
        isMet: /[^A-Za-z0-9]/.test(newPasswordValue),
      },
    ];
  }, [newPasswordValue]);

  const strengthScore = useMemo(() => {
    if (!newPasswordValue) return 0;
    return passwordRequirements.filter((req) => req.isMet).length;
  }, [newPasswordValue, passwordRequirements]);

  const getStrengthConfig = (score: number) => {
    switch (score) {
      case 1:
        return {
          label: "Yếu",
          color: "bg-red-500",
          textColor: "text-red-500",
          width: "w-1/4",
        };
      case 2:
        return {
          label: "Trung bình",
          color: "bg-amber-500",
          textColor: "text-amber-500",
          width: "w-2/4",
        };
      case 3:
        return {
          label: "Khá",
          color: "bg-yellow-500",
          textColor: "text-yellow-600",
          width: "w-3/4",
        };
      case 4:
        return {
          label: "Mạnh",
          color: "bg-emerald-500",
          textColor: "text-emerald-600",
          width: "w-full",
        };
      default:
        return {
          label: "",
          color: "bg-slate-200",
          textColor: "text-slate-400",
          width: "w-0",
        };
    }
  };

  const strengthConfig = getStrengthConfig(strengthScore);

  // ==============================
  // Handle Submit Form
  // ==============================
  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      await comfirmResetPassword.mutateAsync({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      toast.success("Đặt lại mật khẩu thành công!");
      router.replace("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Không thể đặt lại mật khẩu.";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      }
    }
  };

  const isLoading = comfirmResetPassword.isPending;

  return (
    <div className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Các đốm sáng trang trí nền giúp form nổi bật */}
      <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      <form
        id="new-password-form"
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-900/80 scroll-mt-24"
      >
        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Tạo mật khẩu mới
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vui lòng nhập mật khẩu mới bảo mật hơn cho tài khoản của bạn.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {/* MẬT KHẨU MỚI */}
          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                {...register("newPassword")}
                className={`w-full rounded-xl border bg-white/90 py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                  errors.newPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs font-medium text-red-500">
                {errors.newPassword.message}
              </p>
            )}

            {/* COMPONENT ĐO ĐỘ MẠNH YẾU MẬT KHẨU */}
            {newPasswordValue.length > 0 && (
              <div className="mt-3 space-y-2 rounded-xl border border-gray-200/60 bg-gray-50/80 p-3.5 dark:border-gray-700/60 dark:bg-gray-800/50">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-500 dark:text-gray-400">
                    Độ bảo mật:
                  </span>
                  <span className={`font-semibold ${strengthConfig.textColor}`}>
                    {strengthConfig.label}
                  </span>
                </div>

                {/* Thanh tiến trình (Bar) */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-300 ${strengthConfig.color} ${strengthConfig.width}`}
                  />
                </div>

                {/* Danh sách tiêu chí */}
                <div className="mt-2 grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                    >
                      {req.isMet ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
                      )}
                      <span
                        className={
                          req.isMet
                            ? "font-medium text-gray-700 dark:text-gray-200"
                            : "text-gray-400 dark:text-gray-500"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* XÁC NHẬN MẬT KHẨU */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                {...register("confirmPassword")}
                className={`w-full rounded-xl border bg-white/90 py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                  errors.confirmPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang cập nhật...
            </span>
          ) : (
            <span>Cập nhật mật khẩu</span>
          )}
        </button>
      </form>
    </div>
  );
}
