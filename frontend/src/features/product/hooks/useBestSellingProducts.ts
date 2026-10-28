import { useQuery } from '@tanstack/react-query';

import { productService } from '../services/product.service';

export const useBestSellingProducts = (
  limit = 15,
) => {
  return useQuery({
    queryKey: ['products', 'best-selling', limit],
    queryFn: () =>
      productService.getBestSellingProducts(limit),
  });
};