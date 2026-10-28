import { useQuery } from '@tanstack/react-query';

import { bannerService } from '../services/banner.service';

export function useActiveBanners() {
  return useQuery({
    queryKey: ['banners', 'active'],
    queryFn: bannerService.getActiveBanners,
    staleTime: 5 * 60 * 1000,
  });
}