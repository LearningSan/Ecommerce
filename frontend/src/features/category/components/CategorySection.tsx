"use client";

import { useRef, useState, useEffect } from "react";
import { useCategories } from "../hooks/useCategory";
import { CategoryCard } from "./CategoryCard";

export function CategorySection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data, isLoading, isError } = useCategories({
    page: 1,
    limit: 15,
  });

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [data]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Giảm khoảng cách cuộn tương ứng với kích thước nhỏ hơn (220 -> 110)
      const scrollAmount = direction === "left" ? -110 : 110;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading || isError || !data || data.data.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-purple-500/5 shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-3">
          {/* Khối nhận diện "Danh mục" */}
          <div className="flex items-center gap-2 pr-3 border-r border-indigo-200 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs shadow-indigo-500/30">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-indigo-600 leading-none">
                Khám phá
              </span>
              <span className="block text-xs font-extrabold text-gray-900 leading-tight mt-0.5">
                Danh mục
              </span>
            </div>
          </div>

          {/* Nút Cuộn Trái */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-indigo-100 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-20 disabled:pointer-events-none shadow-2xs"
            aria-label="Cuộn trái"
          >
            <svg
              className="h-3 w-3"
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

          {/* Vùng danh mục cuộn ngang */}
          <div
            ref={scrollContainerRef}
            className="flex items-start gap-3 overflow-x-auto scroll-smooth scrollbar-none flex-1 py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {data.data.map((category) => (
              <div
                key={category.id}
                /* Thu nhỏ kích thước khung chứa ảnh/thẻ xuống 1 nửa (w-16 -> w-8, sm:w-20 -> sm:w-10) */
                className="w-8 shrink-0 sm:w-10 transition-transform duration-200"
              >
                <CategoryCard
                  id={category.id}
                  name={category.name}
                  imageUrl={category.imageUrl}
                  slug={category.slug}
                />
              </div>
            ))}
          </div>

          {/* Nút Cuộn Phải */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-indigo-100 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-20 disabled:pointer-events-none shadow-2xs"
            aria-label="Cuộn phải"
          >
            <svg
              className="h-3 w-3"
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
        </div>
      </div>
    </div>
  );
}
