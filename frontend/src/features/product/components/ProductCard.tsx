"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductListItem } from "../types/product.types";
interface ProductCardProps {
  product: ProductListItem;
  priorityImage?: boolean;
}

export function ProductCard({
  product,
  priorityImage = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Tính % giảm giá nếu có originalPrice (hoặc giá trị sale)
  const originalPrice = (product as any).originalPrice;
  const discountPercent =
    originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : null;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10">
      <div>
        {/* Container Ảnh & Badges */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
          <Link
            href={`/product/${product.slug}`}
            className="relative block h-full w-full"
          >
            {!imageError && product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                loading={priorityImage ? "eager" : "lazy"}
                className="object-cover transition-transform duration-500 group-hover:scale-108"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs font-medium text-gray-400">
                Chưa có ảnh
              </div>
            )}
          </Link>

          {/* Badges Giảm Giá / HOT */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {discountPercent ? (
              <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                -{discountPercent}%
              </span>
            ) : product.isDiscounted ? (
              <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                SALE
              </span>
            ) : null}
          </div>

          {/* Nút thả tim Yêu thích (Wishlist) */}
          <button
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-gray-600 transition-all hover:bg-white hover:text-rose-500 active:scale-90 shadow-sm"
            aria-label="Thêm vào yêu thích"
          >
            <svg
              className="h-4 w-4"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              color={isWishlisted ? "#e11d48" : "currentColor"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="pt-3">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="line-clamp-2 min-h-[40px] text-xs font-semibold leading-relaxed text-gray-800 transition-colors group-hover:text-indigo-600 sm:text-sm">
              {product.name}
            </h3>
          </Link>

          {/* Đánh giá & Số lượng đã bán */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-700">
              <span className="text-amber-500">★</span>
              <span className="font-bold">
                {Number(product.ratingAverage || 0).toFixed(1)}
              </span>
              <span className="text-[10px] text-amber-600/70">
                ({product.reviewCount || 0})
              </span>
            </div>

            <span className="text-[11px] font-medium text-gray-400">
              Đã bán{" "}
              {product.soldQuantity >= 1000
                ? `${(product.soldQuantity / 1000).toFixed(1)}k`
                : product.soldQuantity}
            </span>
          </div>

          {/* Hiển thị Giá */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-gray-900 sm:text-lg">
              {product.price.toLocaleString("vi-VN")}đ
            </span>
            {originalPrice && originalPrice > product.price && (
              <span className="text-xs font-medium text-gray-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng */}
      <Link
        href={`/product/${product.slug}`}
        className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900 text-xs font-bold text-white transition-all duration-200 hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        Mua ngay
      </Link>
    </article>
  );
}
