"use client";

import { CategoryProductSection } from "@/features/product/types/product.types";
import { useMemo, useState } from "react";


export function useProductCategoryFilter(categories: CategoryProductSection[]) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>(
    "all",
  );

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.products.length > 0);
  }, [categories]);

  const displayedProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return activeCategories.flatMap((category) => category.products);
    }

    return (
      activeCategories.find(
        (category) => category.categoryId === selectedCategoryId,
      )?.products ?? []
    );
  }, [activeCategories, selectedCategoryId]);

  return {
    activeCategories,
    displayedProducts,
    selectedCategoryId,
    setSelectedCategoryId,
  };
}
