"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import NewPasswordForm from "@/features/auth/components/NewPasswordForm";

export default function NewPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/70">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            Liên kết không hợp lệ
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Mã xác thực đặt lại mật khẩu thiếu hoặc đã hết hạn. Vui lòng kiểm
            tra lại liên kết trong email của bạn.
          </p>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 transition dark:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Yêu cầu gửi lại link mới
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-gray-950">
      <NewPasswordForm token={token} />
    </main>
  );
}
