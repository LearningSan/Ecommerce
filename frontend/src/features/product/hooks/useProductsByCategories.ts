import { useQuery } from "@tanstack/react-query";

import { productService } from "../services/product.service";

export const useProductsByCategories = () => {
  return useQuery({
    queryKey: ["products", "categories"],
    queryFn: () => productService.getProductsByCategories(),
  });
};
