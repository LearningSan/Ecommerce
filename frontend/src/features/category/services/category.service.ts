import api from "@/lib/axios";

import type {
  CategoryListRequest,
  CategoryListResponse,
} from "../types/category.types";

export const categoryService = {
  getCategories: async (
    params: CategoryListRequest,
  ): Promise<CategoryListResponse> => {
    const response = await api.get<CategoryListResponse>("/categories", {
      params,
    });

    return response.data;
  },
};