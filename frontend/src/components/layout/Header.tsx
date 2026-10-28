"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/hooks/use-cart";
export function Header() {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: cart } = useCart();

  const cartCount = cart?.items.length ?? 0;
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const q = searchQuery.trim();

    if (!q) return;

    router.push(`/product?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* Top Bar Ưu đãi */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs py-1.5 px-4 text-center font-medium">
        🔥 Freeship cho đơn hàng từ 500k | Mã{" "}
        <span className="font-bold underline">ECO2026</span> giảm ngay 10%
      </div>

      {/* Main Header Content */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            E
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-800 bg-clip-text text-transparent">
            Ecommerce
          </span>
        </Link>

        {/* Search Bar Tối Ưu */}
        <div className="hidden flex-1 md:block max-w-2xl">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50/80 pl-11 pr-24 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />

            <svg
              className="absolute left-4 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 active:scale-95"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-3 sm:gap-4 text-sm">
          {/* Yêu thích */}
          <Link
            href="/wishlist"
            className="relative p-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            title="Sản phẩm yêu thích"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
              0
            </span>
          </Link>

          {/* Giỏ hàng */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            title="Giỏ hàng"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full p-1 pl-2 pr-3 hover:bg-gray-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                  {user.name}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  useAuthStore.getState().clearAuth();
                  router.push("/");
                }}
                className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition-all active:scale-95"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition-all active:scale-95"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Gọi trực tiếp component danh mục vào đây */}
    </header>
  );
}
