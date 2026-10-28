"use client";

import { useBestSellingProducts } from "@/features/product/hooks/useBestSellingProducts";
import { HomepageProductSection } from "./common/HomepageProductSection";

export function BestSellingSection() {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useBestSellingProducts(15);

  return (
    <HomepageProductSection
      categories={categories}
      isLoading={isLoading}
      isError={isError}
      sectionClassName="bg-gray-50/60"
      allLabel="Tất cả danh mục"
      activeTabClassName="bg-gray-900 text-white shadow-md shadow-gray-900/10"
      inactiveTabClassName="bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      errorMessage="Không thể tải sản phẩm bán chạy. Vui lòng thử lại sau."
      emptyMessage="Hiện chưa có sản phẩm bán chạy."
      categoryEmptyMessage="Không có sản phẩm nào trong danh mục này."
      header={<BestSellingHeader />}
    />
  );
}

function BestSellingHeader() {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <span className="mb-1 inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">
          Được yêu thích
        </span>

        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Sản phẩm bán chạy
        </h2>
      </div>

      <button
        type="button"
        className="group inline-flex items-center text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
      >
        Xem tất cả
        <span className="ml-1 transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
