"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, RefreshCw, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../schemas/auth.schema";
import { useForgotPassword } from "../hooks/useForgotPassword";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const [isWaitingVerify, setIsWaitingVerify] = useState(false);
  const [emailSent, setEmailSent] = useState("");
  const [countdown, setCountdown] = useState(300);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // ==============================
  // Tự động cuộn ra giữa màn hình khi vào trang
  // ==============================
  useEffect(() => {
    document.getElementById("forgot-password-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  // ==============================
  // Lắng nghe sự kiện Broadcast Channel
  // ==============================
  useEffect(() => {
    if (!isWaitingVerify) return;

    const channel = new BroadcastChannel("password-reset");

    const handleMessage = (event: MessageEvent) => {
      const { type, token } = event.data ?? {};

      if (type === "PASSWORD_RESET_VALID" && token) {
        toast.success("Xác thực thành công!");
        router.replace(`/new-password?token=${encodeURIComponent(token)}`);
      }

      if (type === "PASSWORD_RESET_INVALID") {
        toast.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [isWaitingVerify, router]);

  // ==============================
  // Countdown 5 phút
  // ==============================
  useEffect(() => {
    if (!isWaitingVerify || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaitingVerify, countdown]);

  // Handle gửi email
  const handleSendEmail = async (email: string) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setEmailSent(email);
      setCountdown(300);
      setIsWaitingVerify(true);
      toast.success("Đã gửi email đặt lại mật khẩu!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Không thể gửi email đặt lại mật khẩu.";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định.");
      }
    }
  };

  const onSubmit = (data: ForgotPasswordFormData) => {
    const email = data.email.trim().toLowerCase();
    handleSendEmail(email);
  };

  const handleResend = () => {
    if (emailSent) {
      handleSendEmail(emailSent);
    }
  };

  // ==============================
  // TRẠNG THÁI 1: ĐÃ GỬI EMAIL & ĐANG CHỜ XÁC THỰC
  // ==============================
  if (isWaitingVerify) {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
      <div className="relative w-full flex items-center justify-center px-4 py-12">
        {/* Đốm sáng trang trí nền */}
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

        <div
          id="forgot-password-form"
          className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-900/80 scroll-mt-24"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
            <Mail className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Kiểm tra email của bạn
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:
          </p>

          <p className="mt-1 break-all text-base font-semibold text-gray-900 dark:text-white">
            {emailSent}
          </p>

          <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Vui lòng mở email và nhấn vào liên kết. Trang này sẽ tự động chuyển
            hướng khi xác thực hoàn tất.
          </p>

          {/* Khung Countdown */}
          <div className="mt-6 rounded-xl border border-gray-200/60 bg-gray-50/80 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-800/80">
            {countdown > 0 ? (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Liên kết có hiệu lực trong{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <p className="text-sm font-medium text-red-500">
                Liên kết đã hết thời gian chờ.
              </p>
            )}
          </div>

          {/* Các nút thao tác hỗ trợ */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={forgotPasswordMutation.isPending || countdown > 240}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white/60 py-3.5 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700/80 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  forgotPasswordMutation.isPending ? "animate-spin" : ""
                }`}
              />
              {forgotPasswordMutation.isPending
                ? "Đang gửi..."
                : "Gửi lại email"}
            </button>

            <button
              type="button"
              onClick={() => setIsWaitingVerify(false)}
              className="w-full text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
            >
              Đổi địa chỉ email khác
            </button>
          </div>

          {/* Link về trang Đăng nhập */}
          <div className="mt-6 border-t border-gray-200/60 pt-4 dark:border-gray-700/60">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // TRẠNG THÁI 2: FORM NHẬP EMAIL BAN ĐẦU
  // ==============================
  return (
    <div className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Đốm sáng trang trí nền */}
      <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      <form
        id="forgot-password-form"
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-900/80 scroll-mt-24"
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-6">
          <KeyRound className="h-6 w-6" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Quên mật khẩu?
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Đừng lo lắng, hãy nhập email của bạn bên dưới để nhận liên kết đặt lại
          mật khẩu.
        </p>

        <div className="mt-6 space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 block"
          >
            Email đăng ký
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="vd: user@example.com"
              {...register("email")}
              className={`w-full rounded-xl border bg-white/90 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 dark:bg-gray-800/80 dark:text-white dark:focus:bg-gray-800 ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700"
              }`}
            />
          </div>

          {errors.email && (
            <p className="text-xs font-medium text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {forgotPasswordMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang gửi liên kết...
            </span>
          ) : (
            <span>Gửi email đặt lại mật khẩu</span>
          )}
        </button>

        <div className="mt-6 border-t border-gray-200/60 pt-4 text-center dark:border-gray-700/60">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
