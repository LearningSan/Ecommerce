"use client";

import { CategoryProductSection } from "@/features/product/types/product.types";

interface ProductCategoryTabsProps {
  categories: CategoryProductSection[];
  selectedCategoryId: string | number;
  onSelect: (categoryId: string | number) => void;

  allLabel?: string;
  allIcon?: string;

  activeClassName?: string;
  inactiveClassName?: string;
}

export function ProductCategoryTabs({
  categories,
  selectedCategoryId,
  onSelect,
  allLabel = "Tất cả",
  allIcon = "✨",
  activeClassName = "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-600",
  inactiveClassName = "bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 ring-1 ring-transparent",
}: ProductCategoryTabsProps) {
  // Tính tổng số lượng sản phẩm của tất cả danh mục
  const totalProductsCount = categories.reduce(
    (acc, cat) => acc + (cat.products?.length || 0),
    0,
  );

  return (
    <div className="relative mb-8 w-full">
      {/* Scroll Container với hiệu ứng Snap và Scrollbar tinh chỉnh */}
      <div className="flex w-full items-center gap-2.5 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        {/* Tab "Tất cả" */}
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={`group flex shrink-0 snap-start items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
            selectedCategoryId === "all" ? activeClassName : inactiveClassName
          }`}
        >
          {allIcon && (
            <span className="text-sm transition-transform group-hover:scale-110">
              {allIcon}
            </span>
          )}
          <span>{allLabel}</span>

          <span
            className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
              selectedCategoryId === "all"
                ? "bg-white/20 text-white"
                : "bg-gray-200/80 text-gray-500 group-hover:bg-gray-300/60"
            }`}
          >
            {totalProductsCount}
          </span>
        </button>

        {/* Danh sách các danh mục */}
        {categories.map((category) => {
          const isActive = selectedCategoryId === category.categoryId;

          return (
            <button
              key={category.categoryId}
              type="button"
              onClick={() => onSelect(category.categoryId)}
              className={`group flex shrink-0 snap-start items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                isActive ? activeClassName : inactiveClassName
              }`}
            >
              <span>{category.categoryName}</span>

              <span
                className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200/80 text-gray-500 group-hover:bg-gray-300/60"
                }`}
              >
                {category.products?.length || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
