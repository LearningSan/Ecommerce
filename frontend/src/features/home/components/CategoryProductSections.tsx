"use client";

import { useProductsByCategories } from "@/features/product/hooks/useProductsByCategories";
import { HomepageProductSection } from "./common/HomepageProductSection";

export function CategoryProductSections() {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useProductsByCategories();

  return (
    <HomepageProductSection
      categories={categories}
      isLoading={isLoading}
      isError={isError}
      sectionClassName="bg-gray-50/50"
      allLabel="Tất cả"
      activeTabClassName="bg-gray-900 text-white shadow-md shadow-gray-900/10"
      inactiveTabClassName="bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      errorMessage="Không thể tải sản phẩm theo danh mục. Vui lòng thử lại sau."
      emptyMessage="Hiện chưa có sản phẩm trong các danh mục."
      categoryEmptyMessage="Chưa có sản phẩm nào trong danh mục này."
      header={<CategoryProductHeader />}
    />
  );
}

function CategoryProductHeader() {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
          Khám phá danh mục
        </p>

        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Sản phẩm theo danh mục
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

