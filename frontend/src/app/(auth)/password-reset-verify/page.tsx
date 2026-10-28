"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

import { useVerifyForgotPasswordToken } from "@/features/auth/hooks/usePasswordReset";

export default function PasswordResetVerifyPage() {
  const searchParams = useSearchParams();
  const verifyMutation = useVerifyForgotPasswordToken();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [errorMessage, setErrorMessage] = useState(
    "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  );

  const isCalledRef = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực trong đường dẫn.");
      return;
    }

    if (isCalledRef.current) {
      return;
    }

    isCalledRef.current = true;

    const verify = async () => {
      const channel = new BroadcastChannel("password-reset");

      try {
        await verifyMutation.mutateAsync({
          token,
        });

        channel.postMessage({
          type: "PASSWORD_RESET_VALID",
          token,
        });

        setStatus("success");
      } catch (error) {
        channel.postMessage({
          type: "PASSWORD_RESET_INVALID",
        });

        setStatus("error");

        if (axios.isAxiosError(error)) {
          const apiMessage = error.response?.data?.message;

          if (Array.isArray(apiMessage)) {
            setErrorMessage(apiMessage.join(", "));
          } else if (apiMessage) {
            setErrorMessage(apiMessage);
          }
        }
      } finally {
        channel.close();
      }
    };

    verify();
  }, [token, verifyMutation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          {status === "loading" && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {status === "success" && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
          )}

          {status === "error" && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <XCircle className="h-9 w-9" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {status === "loading" && "Đang xác thực liên kết..."}
            {status === "success" && "Xác thực thành công!"}
            {status === "error" && "Xác thực thất bại"}
          </h1>

          <p className="text-sm leading-relaxed text-slate-500">
            {status === "loading" &&
              "Vui lòng chờ trong giây lát, chúng tôi đang kiểm tra thông tin liên kết của bạn."}

            {status === "success" &&
              "Liên kết đặt lại mật khẩu hợp lệ. Bạn có thể tiếp tục tạo mật khẩu mới."}

            {status === "error" && errorMessage}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          {status === "success" && token && (
            <div className="space-y-3">
              <Link
                href={`/new-password?token=${encodeURIComponent(token)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <KeyRound className="h-4 w-4" />
                Đặt lại mật khẩu
              </Link>

              <p className="text-xs text-slate-400">
                Nhấn nút trên để tiếp tục tạo mật khẩu mới.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="inline-block w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Yêu cầu gửi lại liên kết
              </Link>

              <div>
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
                >
                  Quay lại trang đăng nhập
                </Link>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang xác thực an toàn...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
