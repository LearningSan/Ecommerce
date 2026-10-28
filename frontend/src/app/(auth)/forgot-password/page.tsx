import { Suspense } from "react";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Suspense
        fallback={<div className="text-sm text-gray-500">Đang tải...</div>}
      >
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
