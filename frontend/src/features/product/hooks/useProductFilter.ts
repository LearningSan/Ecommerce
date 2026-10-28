import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import type { ProductFilterRequest } from "../types/product.types";

export const useProductFilter = (
  params: ProductFilterRequest,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["products", "filter", params],
    queryFn: () => productService.filterProducts(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};
