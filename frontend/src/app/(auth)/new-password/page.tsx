import { Suspense } from "react";
import NewPasswordPageContent from "./NewPasswordPageContent";

export default function NewPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-gray-950">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </main>
      }
    >
      <NewPasswordPageContent />
    </Suspense>
  );
}
