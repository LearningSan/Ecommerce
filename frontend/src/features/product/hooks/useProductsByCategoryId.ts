import { useQuery } from "@tanstack/react-query";

import { productService } from "../services/product.service";

export const useProductsByCategoryId = (categoryId: number, limit = 15) => {
  return useQuery({
    queryKey: ["products", "category", categoryId, limit],
    queryFn: () => productService.getProductsByCategoryId(categoryId, limit),
    enabled: categoryId > 0,
  });
};
