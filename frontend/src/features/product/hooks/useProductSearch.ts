import { useQuery } from "@tanstack/react-query";

import { productService } from "../services/product.service";
import type { ProductSearchRequest } from "../types/product.types";

export const useProductSearch = (
  data: ProductSearchRequest,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["products", "search", data],
    queryFn: () => productService.searchProducts(data),
    enabled,
  });
};
