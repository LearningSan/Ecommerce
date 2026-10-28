"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useProductSearch } from "@/features/product/hooks/useProductSearch";
import type {
  ProductFilterSort,
  ProductSearchRequest,
} from "@/features/product/types/product.types";
import { ProductGrid } from "@/features/product/components/ProductGrid";
import {getPositiveNumber,getNonNegativeNumber } from "@/lib/utils/number";
const DEFAULT_LIMIT = 12;

const SORT_OPTIONS: {
  value: ProductFilterSort;
  label: string;
  icon: string;
}[] = [
  { value: "popular", label: "Bán chạy", icon: "🔥" },
  { value: "newest", label: "Mới nhất", icon: "⭐" },
  { value: "discount_desc", label: "Giảm giá sốc", icon: "⚡" },
  { value: "price_asc", label: "Giá thấp ➔ cao", icon: "⬆️" },
  { value: "price_desc", label: "Giá cao ➔ thấp", icon: "⬇️" },
];


function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPriceInputs, setShowPriceInputs] = useState(false);

  const q = searchParams.get("q")?.trim() ?? "";
  const categoryId = getPositiveNumber(searchParams.get("categoryId"));
  const brandId = getPositiveNumber(searchParams.get("brandId"));
  const minPrice = getNonNegativeNumber(searchParams.get("minPrice"));
  const maxPrice = getNonNegativeNumber(searchParams.get("maxPrice"));
  const isDiscounted = searchParams.get("isDiscounted") === "true";

  const page = Math.max(1, getPositiveNumber(searchParams.get("page")) ?? 1);
  const limit = Math.min(
    100,
    getPositiveNumber(searchParams.get("limit")) ?? DEFAULT_LIMIT,
  );

  const rawSort = searchParams.get("sort");
  const validSorts: ProductFilterSort[] = [
    "relevance",
    "popular",
    "newest",
    "discount_desc",
    "price_asc",
    "price_desc",
  ];

  const sort: ProductFilterSort =
    rawSort && validSorts.includes(rawSort as ProductFilterSort)
      ? (rawSort as ProductFilterSort)
      : "popular";

  const [selectedSort, setSelectedSort] = useState<ProductFilterSort>(sort);
  const [selectedBrandId, setSelectedBrandId] = useState(
    brandId?.toString() ?? "",
  );
  const [selectedMinPrice, setSelectedMinPrice] = useState(
    minPrice?.toString() ?? "",
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(
    maxPrice?.toString() ?? "",
  );
  const [selectedDiscounted, setSelectedDiscounted] = useState(isDiscounted);

  useEffect(() => {
    setSelectedSort(sort);
    setSelectedBrandId(brandId?.toString() ?? "");
    setSelectedMinPrice(minPrice?.toString() ?? "");
    setSelectedMaxPrice(maxPrice?.toString() ?? "");
    setSelectedDiscounted(isDiscounted);
  }, [sort, brandId, minPrice, maxPrice, isDiscounted]);

  const filterRequest: ProductSearchRequest = {
    q: q || undefined,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    isDiscounted: isDiscounted ? true : undefined,
    sort,
    page,
    limit,
  };

  const { data, isLoading, isError, refetch } = useProductSearch(filterRequest);

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function updateUrl(next: Partial<ProductSearchRequest>) {
    const params = new URLSearchParams(searchParams.toString());

    const keys: (keyof ProductSearchRequest)[] = [
      "q",
      "categoryId",
      "brandId",
      "minPrice",
      "maxPrice",
      "isDiscounted",
      "sort",
      "page",
      "limit",
    ];

    for (const key of keys) {
      if (!(key in next)) continue;

      const value = next[key];

      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    if (
      "q" in next ||
      "categoryId" in next ||
      "brandId" in next ||
      "minPrice" in next ||
      "maxPrice" in next ||
      "isDiscounted" in next ||
      "sort" in next
    ) {
      params.delete("page");
    }

    const queryString = params.toString();
    router.push(queryString ? `/product?${queryString}` : "/product");
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextBrandId = getPositiveNumber(selectedBrandId || null);
    const nextMinPrice = getNonNegativeNumber(selectedMinPrice || null);
    const nextMaxPrice = getNonNegativeNumber(selectedMaxPrice || null);

    if (
      nextMinPrice !== undefined &&
      nextMaxPrice !== undefined &&
      nextMinPrice > nextMaxPrice
    ) {
      return;
    }

    updateUrl({
      brandId: nextBrandId,
      minPrice: nextMinPrice,
      maxPrice: nextMaxPrice,
      isDiscounted: selectedDiscounted ? true : undefined,
      sort: selectedSort,
      page: 1,
    });
  }

  function clearFilters() {
    setSelectedSort("popular");
    setSelectedBrandId("");
    setSelectedMinPrice("");
    setSelectedMaxPrice("");
    setSelectedDiscounted(false);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", String(categoryId));

    router.push(params.size ? `/product?${params}` : "/product");
  }

  const invalidPriceRange =
    selectedMinPrice.trim() !== "" &&
    selectedMaxPrice.trim() !== "" &&
    Number(selectedMinPrice) > Number(selectedMaxPrice);

  const hasActiveFilters =
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    isDiscounted ||
    sort !== "popular";

  const heading = q
    ? `Kết quả tìm kiếm: "${q}"`
    : categoryId
      ? "Sản phẩm theo danh mục"
      : "Tất cả sản phẩm";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Sản phẩm</span>
        </nav>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
            {!isLoading && !isError && (
              <p className="mt-1 text-sm text-gray-500">
                Tìm thấy{" "}
                <span className="font-semibold text-gray-700">
                  {total.toLocaleString("vi-VN")}
                </span>{" "}
                sản phẩm
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* KHU VỰC BỘ LỌC HIỆN ĐẠI (UI/UX CHUẨN E-COMMERCE) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  Bộ lọc & Sắp xếp
                </h2>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-full transition"
                >
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>

            {/* DÒNG 1: SẮP XẾP NẰM NGANG (ICON + TÊN) */}
            <div className="mb-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Sắp xếp theo
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {SORT_OPTIONS.map((option) => {
                  const isActive = selectedSort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedSort(option.value);
                        updateUrl({ sort: option.value, page: 1 });
                      }}
                      className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-base">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DÒNG 2: BỘ LỌC BỔ SUNG (GIẢM GIÁ & KHOẢNG GIÁ) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              {/* Lọc nhanh khuyến mãi */}
              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  selectedDiscounted
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDiscounted}
                  onChange={(event) =>
                    setSelectedDiscounted(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-amber-600"
                />
                <span>⚡ Sản phẩm đang giảm giá</span>
              </label>

              {/* Nút bật/tắt khung lọc khoảng giá */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPriceInputs((prev) => !prev)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    minPrice || maxPrice
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>💰 Khoảng giá</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${showPriceInputs ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Panel nhập giá thu gọn dạng dropdown hiện đại */}
                {showPriceInputs && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                    <form
                      onSubmit={(e) => {
                        handleFilterSubmit(e);
                        setShowPriceInputs(false);
                      }}
                      className="space-y-3"
                    >
                      <div className="text-xs font-semibold text-gray-500 uppercase">
                        Nhập mức giá (VNĐ)
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={selectedMinPrice}
                          onChange={(event) =>
                            setSelectedMinPrice(event.target.value)
                          }
                          placeholder="Từ (VD: 100000)"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={selectedMaxPrice}
                          onChange={(event) =>
                            setSelectedMaxPrice(event.target.value)
                          }
                          placeholder="Đến (VD: 5000000)"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>

                      {invalidPriceRange && (
                        <p className="text-xs text-red-600">
                          Giá thấp nhất không được lớn hơn giá cao nhất.
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMinPrice("");
                            setSelectedMaxPrice("");
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                        >
                          Xóa
                        </button>
                        <button
                          type="submit"
                          disabled={invalidPriceRange}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Áp dụng giá
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className="min-w-0">
            {isError ? (
              <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
                <p className="text-red-600 font-medium">
                  Không thể tải danh sách sản phẩm lúc này.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} isLoading={isLoading} />

                {!isLoading && totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => updateUrl({ page: page - 1 })}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Trước
                    </button>
                    <span className="px-4 text-sm font-medium text-gray-600">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => updateUrl({ page: page + 1 })}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500 font-medium">
          Đang tải danh sách sản phẩm...
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
