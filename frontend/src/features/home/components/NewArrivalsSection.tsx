"use client";

import { useNewProducts } from "@/features/product/hooks/useNewProducts";
import { HomepageProductSection } from "./common/HomepageProductSection";

export function NewArrivalsSection() {
  const { data: categories = [], isLoading, isError } = useNewProducts(15);

  return (
    <HomepageProductSection
      categories={categories}
      isLoading={isLoading}
      isError={isError}
      sectionClassName="bg-white"
      allLabel="Tất cả sản phẩm"
      allIcon="✨"
      activeTabClassName="bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
      inactiveTabClassName="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      errorMessage="Không thể tải sản phẩm mới. Vui lòng thử lại sau."
      emptyMessage="Hiện chưa có sản phẩm mới."
      categoryEmptyMessage="Không có sản phẩm nào trong danh mục này."
      header={<NewArrivalsHeader />}
    />
  );
}

function NewArrivalsHeader() {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            NEW
          </span>

          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Mới về hàng
          </p>
        </div>

        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Sản phẩm mới
        </h2>
      </div>

      <button
        type="button"
        className="group inline-flex items-center text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
      >
        Xem tất cả
        <span className="ml-1 transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
