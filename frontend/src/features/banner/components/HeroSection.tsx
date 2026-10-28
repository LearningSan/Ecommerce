"use client";

import { useState } from "react";
import { useActiveBanners } from "../hooks/useActiveBanners";

export function HeroSection() {
  const { data: banners, isLoading, isError } = useActiveBanners();

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <section className="bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="h-[380px] animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </section>
    );
  }

  if (isError || !banners?.length) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="relative overflow-hidden rounded-2xl">
          {currentBanner.linkUrl ? (
            <a href={currentBanner.linkUrl} className="block">
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title ?? "Banner"}
                className="h-[380px] w-full object-cover"
              />
            </a>
          ) : (
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title ?? "Banner"}
              className="h-[380px] w-full object-cover"
            />
          )}

          {/* Previous */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xl text-white transition hover:bg-black/60"
                aria-label="Banner trước"
              >
                ‹
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xl text-white transition hover:bg-black/60"
                aria-label="Banner tiếp theo"
              >
                ›
              </button>
            </>
          )}

          {/* Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Chuyển đến banner ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
