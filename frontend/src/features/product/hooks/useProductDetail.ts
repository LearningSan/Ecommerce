import { useQuery } from "@tanstack/react-query";

import { productService } from "../services/product.service";

export const useProductDetail = (slug: string) => {
  return useQuery({
    queryKey: ["products", "detail", slug],
    queryFn: () => productService.getProductDetail(slug),
    enabled: slug.trim().length > 0,
  });
};
