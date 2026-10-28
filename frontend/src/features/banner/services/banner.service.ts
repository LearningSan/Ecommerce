import api from '@/lib/axios';
import { Banner } from '../types/banner.types';
export const bannerService = {
  getActiveBanners: async (): Promise<Banner[]> => {
    const response = await api.get<Banner[]>('/banners/active');

    return response.data;
  },
};