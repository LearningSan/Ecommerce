import { useQuery } from '@tanstack/react-query';

import { productService } from '../services/product.service';

export const useNewProducts = (
  limit = 15,
) => {
  return useQuery({
    queryKey: ['products', 'new', limit],
    queryFn: () => productService.getNewProducts(limit),
  });
};