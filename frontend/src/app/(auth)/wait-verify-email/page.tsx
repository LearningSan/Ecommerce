import { Suspense } from "react";
import WaitVerifyEmailContent from "./WaitVerifyEmailContent";

export default function WaitVerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        </main>
      }
    >
      <WaitVerifyEmailContent />
    </Suspense>
  );
}
