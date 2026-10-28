"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useHomepagePromotions } from "../hooks/useHomePagePromotion";
import type { HomepagePromotion } from "../types/promotion.types";

export function PromotionSection() {
  const { data: promotions, isLoading, isError } = useHomepagePromotions(6);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return <PromotionSkeleton />;
  }

  if (isError || !promotions?.length) {
    return null;
  }

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header đơn giản, gọn gàng */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20">
              🔥
            </div>
            <h2 className="text-base font-extrabold tracking-tight text-gray-900 sm:text-lg">
              Khuyến Mãi & Sự Kiện
            </h2>
          </div>

          <Link
            href="/promotions"
            className="text-xs font-bold text-amber-600 transition-colors hover:text-amber-700 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* Khung chứa Carousel kèm Nút điều hướng ở 2 bên */}
        <div className="relative group">
          {/* Nút Trái (Chỉ hiện trên desktop khi rê chuột vào khung) */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute -left-4 top-1/2 z-10 hidden sm:flex -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white/90 backdrop-blur-md text-gray-700 shadow-xl transition-all duration-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 active:scale-95 opacity-0 group-hover:opacity-100"
            aria-label="Cuộn sang trái"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Nút Phải (Chỉ hiện trên desktop khi rê chuột vào khung) */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute -right-4 top-1/2 z-10 hidden sm:flex -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white/90 backdrop-blur-md text-gray-700 shadow-xl transition-all duration-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 active:scale-95 opacity-0 group-hover:opacity-100"
            aria-label="Cuộn sang phải"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Băng chuyền cuộn ngang các banner khuyến mãi */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 pt-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 px-1"
          >
            {promotions.map((promotion) => (
              <PromotionBannerCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PromotionBannerCard({ promotion }: { promotion: HomepagePromotion }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/promotions/${promotion.id}`}
      className="group/card relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-900 to-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 sm:w-[340px]"
    >
      {/* Phần Hình ảnh Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-800">
        {!imageError && promotion.promotionImage ? (
          <Image
            src={promotion.promotionImage}
            alt={promotion.name}
            fill
            sizes="(max-width: 640px) 280px, 340px"
            className="object-cover transition-transform duration-700 group-hover/card:scale-108"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Ưu đãi đặc biệt
          </div>
        )}

        {/* Gradient mờ ảo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge nổi bật góc trái */}
        <div className="absolute left-3 top-3">
          <span className="rounded-md bg-rose-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
            HOT DEAL
          </span>
        </div>
      </div>

      {/* Phần Nội dung */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-white transition-colors group-hover/card:text-amber-400">
          {promotion.name}
        </h3>
        
        <div className="mt-2.5 flex items-center justify-between border-t border-gray-800 pt-2.5 text-[11px]">
          <span className="text-gray-400 font-medium">Sự kiện có hạn</span>
          <span className="font-bold text-amber-400 group-hover/card:translate-x-0.5 transition-transform">
            Tham gia ngay →
          </span>
        </div>
      </div>
    </Link>
  );
}

function PromotionSkeleton() {
  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-[280px] shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white sm:w-[340px]"
            >
              <div className="aspect-[16/9] animate-pulse bg-gray-200" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}