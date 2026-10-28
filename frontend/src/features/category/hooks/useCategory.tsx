import { useQuery } from "@tanstack/react-query";

import { categoryService } from "../services/category.service";

import type { CategoryListRequest } from "../types/category.types";

export const useCategories = (params: CategoryListRequest) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryService.getCategories(params),
  });
};
