"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { useResendVerifyEmail } from "@/features/auth/hooks/useResendVerifyEmail";

export default function WaitVerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");

  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const resendVerificationEmail = useResendVerifyEmail();

  useEffect(() => {
    const channel = new BroadcastChannel("email-verification");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "EMAIL_VERIFIED") {
        toast.success("Xác nhận email thành công!");
        router.replace("/login?verified=true");
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0 || isResending) return;

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    setIsResending(true);

    try {
      await resendVerificationEmail.mutateAsync({ email });

      toast.success("Đã gửi lại email xác nhận!");
      setCountdown(60);
    } catch {
      toast.error("Gửi lại email thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center space-y-6">
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full animate-ping opacity-75" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 rounded-full text-blue-600 dark:text-blue-400 shadow-sm">
            <Mail className="w-9 h-9" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Kiểm tra hòm thư của bạn
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Chúng tôi đã gửi một đường dẫn xác thực đến email của bạn. Vui lòng
            mở email và bấm vào nút{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              "Xác nhận địa chỉ Email"
            </span>
            .
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 w-fit mx-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Trang này sẽ tự động chuyển hướng sau khi xác nhận
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={countdown > 0 || isResending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
            />

            {countdown > 0
              ? `Gửi lại sau (${countdown}s)`
              : isResending
                ? "Đang gửi..."
                : "Không nhận được email? Gửi lại"}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Quay lại trang đăng nhập
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </main>
  );
}
