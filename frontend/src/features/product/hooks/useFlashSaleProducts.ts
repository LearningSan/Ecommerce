import { useQuery } from '@tanstack/react-query';

import { productService } from '../services/product.service';

export const useFlashSaleProducts = (
  limit = 15,
) => {
  return useQuery({
    queryKey: ['products', 'flash-sale', limit],
    queryFn: () => productService.getFlashSaleProducts(limit),
  });
};