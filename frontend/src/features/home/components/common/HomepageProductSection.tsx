"use client";

import { useState, type ReactNode } from "react";

import { ProductCategoryTabs } from "./ProductCategoryTabs";
import { CategoryProductSection } from "@/features/product/types/product.types";
import { useProductCategoryFilter } from "../../hooks/useProductCategoryFilter";
import { ProductGrid } from "@/features/product/components/ProductGrid";

interface HomepageProductSectionProps {
  categories: CategoryProductSection[];

  isLoading: boolean;
  isError: boolean;

  header: ReactNode;

  allLabel?: string;
  allIcon?: string;

  activeTabClassName?: string;
  inactiveTabClassName?: string;

  errorMessage: string;
  emptyMessage: string;
  categoryEmptyMessage: string;

  sectionClassName?: string;
}

export function HomepageProductSection({
  categories,
  isLoading,
  isError,
  header,

  allLabel = "Tất cả",
  allIcon,

  activeTabClassName,
  inactiveTabClassName,

  errorMessage,
  emptyMessage,
  categoryEmptyMessage,

  sectionClassName = "bg-white",
}: HomepageProductSectionProps) {
  const {
    activeCategories,
    displayedProducts,
    selectedCategoryId,
    setSelectedCategoryId,
  } = useProductCategoryFilter(categories);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Tối đa 10 sản phẩm mỗi trang (2 hàng x 5 cột)

  const totalPages = Math.ceil(displayedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = displayedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleSelectCategory = (categoryId: any) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  return (
    <section className={`${sectionClassName} py-6 sm:py-8`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header thông thường */}
        <div className="mb-4">{header}</div>

        {isLoading && <ProductGridSkeleton />}

        {isError && <ProductSectionError message={errorMessage} />}

        {!isLoading && !isError && (
          <>
            {activeCategories.length === 0 ? (
              <ProductSectionEmpty message={emptyMessage} />
            ) : (
              <>
                <ProductCategoryTabs
                  categories={activeCategories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={handleSelectCategory}
                  allLabel={allLabel}
                  allIcon={allIcon}
                  activeClassName={activeTabClassName}
                  inactiveClassName={inactiveTabClassName}
                />

                {currentProducts.length > 0 ? (
                  /* Khung chứa lưới sản phẩm kèm nút chuyển trang nổi bật ở 2 bên */
                  <div className="relative group mt-4">
                    {/* Nút Trái (Chỉ hiện khi tổng trang > 1) */}
                    {totalPages > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="absolute -left-4 sm:-left-5 top-1/2 z-10 flex -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-100 bg-white/95 backdrop-blur-md text-gray-800 shadow-xl transition-all duration-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                        aria-label="Trang trước"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Nút Phải (Chỉ hiện khi tổng trang > 1) */}
                    {totalPages > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="absolute -right-4 sm:-right-5 top-1/2 z-10 flex -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-100 bg-white/95 backdrop-blur-md text-gray-800 shadow-xl transition-all duration-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                        aria-label="Trang sau"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Badge hiển thị số trang ở góc phải trên lưới sản phẩm nếu có phân trang */}
                    {totalPages > 1 && (
                      <div className="absolute -top-7 right-0 text-xs font-semibold text-gray-500 bg-gray-100/80 px-2.5 py-0.5 rounded-full">
                        Trang {currentPage} / {totalPages}
                      </div>
                    )}

                    <div className="transition-all duration-300">
                      <ProductGrid products={currentProducts} />
                    </div>
                  </div>
                ) : (
                  <ProductSectionEmpty message={categoryEmptyMessage} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-3 h-4 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSectionEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

function ProductSectionError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-6 text-center text-xs font-medium text-red-600">
      {message}
    </div>
  );
}
