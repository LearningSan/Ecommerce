import { Suspense } from "react";
import EmailVerifyContent from "./EmailVerifyContent";

export default function EmailVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-slate-100">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Đang xác thực Email
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed">
              Đang xác nhận thông tin email...
            </p>
          </div>
        </main>
      }
    >
      <EmailVerifyContent />
    </Suspense>
  );
}
