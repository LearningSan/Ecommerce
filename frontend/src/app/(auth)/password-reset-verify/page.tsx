
import { Suspense } from "react";
import PasswordResetVerifyContent from "./PasswordResetVerifyContent";

export default function PasswordResetVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        </main>
      }
    >
      <PasswordResetVerifyContent />
    </Suspense>
  );
}
