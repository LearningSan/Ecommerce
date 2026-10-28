"use client";

import type { ProductListItem } from "../types/product.types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products?: ProductListItem[];
  isLoading?: boolean;
}

export function ProductGrid({
  products = [],
  isLoading = false,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (!products.length) {
    return (
      <div className="mx-auto my-12 flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          🔍
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-900">
          Không tìm thấy sản phẩm
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Rất tiếc, hiện tại không có sản phẩm nào phù hợp với yêu cầu của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priorityImage={index === 0}
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3"
        >
          <div>
            <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
