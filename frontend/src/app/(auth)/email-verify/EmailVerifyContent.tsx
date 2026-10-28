"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";

export default function EmailVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyEmailMutation = useVerifyEmail();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Đang xác nhận thông tin email...");
  const [countdown, setCountdown] = useState(5);

  const isCalledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Mã xác thực không hợp lệ hoặc thiếu tham số.");
      return;
    }

    if (isCalledRef.current) return;
    isCalledRef.current = true;

    const verifyEmail = async () => {
      const channel = new BroadcastChannel("email-verification");

      try {
        await verifyEmailMutation.mutateAsync({ token });

        channel.postMessage({ type: "EMAIL_VERIFIED" });

        setStatus("success");
        setMessage("Địa chỉ email của bạn đã được xác thực thành công!");
      } catch (error) {
        setStatus("error");

        if (axios.isAxiosError(error)) {
          const apiMessage = error.response?.data?.message;

          if (Array.isArray(apiMessage)) {
            setMessage(apiMessage.join(", "));
          } else if (apiMessage) {
            setMessage(apiMessage);
          } else {
            setMessage("Liên kết xác thực đã hết hạn hoặc không khả thi.");
          }
        } else {
          setMessage("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
        }
      } finally {
        channel.close();
      }
    };

    void verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-slate-100">
        <div className="flex justify-center">
          {status === "loading" && (
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          )}

          {status === "success" && (
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
              ✓
            </div>
          )}

          {status === "error" && (
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
              ✕
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          {status === "loading" && "Đang xác thực Email"}
          {status === "success" && "Xác thực thành công!"}
          {status === "error" && "Xác thực thất bại"}
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed">{message}</p>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          {status === "success" && (
            <>
              <p className="text-xs text-slate-400">
                Tự động chuyển đến trang đăng nhập sau{" "}
                <span className="font-semibold text-indigo-600">
                  {countdown}s
                </span>
              </p>

              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm active:scale-[0.98]"
              >
                Đăng nhập ngay
              </button>
            </>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                Đi đến trang Đăng nhập
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {status === "loading" && (
            <p className="text-xs text-slate-400">
              Vui lòng chờ trong giây lát...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
