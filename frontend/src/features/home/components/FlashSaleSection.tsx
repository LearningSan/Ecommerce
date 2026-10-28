"use client";

import { useEffect, useState } from "react";

import { useFlashSaleProducts } from "@/features/product/hooks/useFlashSaleProducts";
import { HomepageProductSection } from "./common/HomepageProductSection";

export function FlashSaleSection() {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useFlashSaleProducts(15);

  return (
    <HomepageProductSection
      categories={categories}
      isLoading={isLoading}
      isError={isError}
      sectionClassName="bg-gradient-to-b from-red-50/50 via-white to-white"
      allLabel="Tất cả"
      allIcon="🔥"
      activeTabClassName="bg-red-600 text-white shadow-md shadow-red-600/20"
      inactiveTabClassName="bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      errorMessage="Không thể tải sản phẩm Flash Sale. Vui lòng thử lại sau."
      emptyMessage="Hiện chưa có sản phẩm Flash Sale nào."
      categoryEmptyMessage="Không tìm thấy sản phẩm trong danh mục này."
      header={<FlashSaleHeader />}
    />
  );
}

function FlashSaleHeader() {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>

          <p className="text-xs font-bold uppercase tracking-wider text-red-600">
            Ưu đãi giới hạn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Flash Sale
          </h2>

          <FlashSaleCountdown />
        </div>
      </div>

      <button
        type="button"
        className="group inline-flex items-center text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
      >
        Xem tất cả ưu đãi

        <span className="ml-1 transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}

function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 text-xs font-bold text-white">
      <span className="rounded bg-gray-900 px-2 py-1">
        {format(timeLeft.hours)}
      </span>

      <span className="text-gray-900">:</span>

      <span className="rounded bg-gray-900 px-2 py-1">
        {format(timeLeft.minutes)}
      </span>

      <span className="text-gray-900">:</span>

      <span className="rounded bg-red-600 px-2 py-1">
        {format(timeLeft.seconds)}
      </span>
    </div>
  );
}
