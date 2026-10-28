import api from "@/lib/axios";

import type {
  CategoryProductSection,
  ProductDetailResponse,
  ProductListItem,
  ProductSearchRequest,
  ProductSearchResponse,
} from "../types/product.types";

export const productService = {
   searchProducts: async (
    data: ProductSearchRequest,
  ): Promise<ProductSearchResponse> => {
    const response = await api.get<ProductSearchResponse>(
      "/products/search",
      {
        params: data,
      },
    );

    return response.data;
  },

  getFlashSaleProducts: async (
    limit = 15,
  ): Promise<CategoryProductSection[]> => {
    const response = await api.get<CategoryProductSection[]>(
      "/products/flash-sale",
      {
        params: { limit },
      },
    );

    return response.data;
  },

  getBestSellingProducts: async (
    limit = 15,
  ): Promise<CategoryProductSection[]> => {
    const response = await api.get<CategoryProductSection[]>(
      "/products/best-selling",
      {
        params: { limit },
      },
    );

    return response.data;
  },

  getNewProducts: async (limit = 15): Promise<CategoryProductSection[]> => {
    const response = await api.get<CategoryProductSection[]>("/products/new", {
      params: { limit },
    });

    return response.data;
  },

  getProductsByCategoryId: async (
    categoryId: number,
    limit = 15,
  ): Promise<ProductListItem[]> => {
    const response = await api.get<ProductListItem[]>(
      `/products/category/${categoryId}`,
      {
        params: { limit },
      },
    );

    return response.data;
  },

  getProductsByCategories: async (): Promise<CategoryProductSection[]> => {
    const response = await api.get<CategoryProductSection[]>(
      "/products/categories",
    );

    return response.data;
  },
  getProductDetail: async (
  slug: string,
): Promise<ProductDetailResponse> => {
  const response = await api.get<ProductDetailResponse>(
    `/products/${encodeURIComponent(slug)}`,
  );

  return response.data;
},
};
