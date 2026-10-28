import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl mix-blend-multiply animate-blob dark:bg-blue-600/20" />
      <div className="animation-delay-2000 absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl mix-blend-multiply animate-blob dark:bg-purple-600/20" />
      <div className="animation-delay-4000 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400/20 blur-3xl mix-blend-multiply animate-blob dark:bg-pink-600/10" />

      {/* Layout Content (1 Cột trên Mobile, 2 Cột trên Desktop) */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center gap-12 lg:justify-between">
        {/* Left Side: Animated Illustration / Intro Banner (Chỉ hiện ở màn hình lớn) */}
        <div className="hidden flex-1 flex-col justify-center space-y-6 lg:flex">
          <div className="relative flex items-center justify-center">
            {/* 3D Illustration / SVG / Animated Vector */}
            <img
              src="/images/login.png"
              alt="Login Animation Illustration"
              className="h-auto max-w-md animate-pulse duration-[3000ms]"
            />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Khám phá trải nghiệm tuyệt vời
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bảo mật và hiệu quả hơn.
            </p>
          </div>
        </div>

        {/* Right Side: Form Đăng nhập */}
        <div className="flex w-full items-center justify-center lg:w-auto">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
