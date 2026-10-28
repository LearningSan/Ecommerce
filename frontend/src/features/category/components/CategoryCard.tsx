"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  id: number | string;
  name: string;
  imageUrl?: string;
  slug?: string;
}

export function CategoryCard({ id, name, imageUrl, slug }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryHref = `/product?categoryId=${encodeURIComponent(String(id))}`;
  return (
    <Link
      href={categoryHref}
      className="group flex flex-col items-center text-center focus:outline-none p-1"
    >
      {/* Giảm kích thước khung ảnh xuống một nửa: w-12 -> w-6, sm:w-14 -> sm:w-7 */}
      <div className="relative aspect-square w-6 sm:w-7 shrink-0 overflow-hidden rounded-full p-[1px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-sm transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-white ring-1 ring-white">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 24px, 28px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <span className="text-[8px] font-bold uppercase">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thu nhỏ độ rộng text tương ứng (w-16 -> w-10, sm:w-20 -> sm:w-12) và giảm kích thước chữ cho cân đối */}
      <span className="mt-1 w-10 sm:w-12 line-clamp-2 px-0.5 text-[8px] font-medium leading-tight text-gray-700 transition-colors duration-200 group-hover:text-indigo-600 group-hover:font-semibold">
        {name}
      </span>
    </Link>
  );
}
