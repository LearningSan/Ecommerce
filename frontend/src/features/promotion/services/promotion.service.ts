import api from "@/lib/axios";
import type { HomepagePromotion } from "../types/promotion.types";
export const promotionService = {
  getHomepagePromotions: async (limit = 6): Promise<HomepagePromotion[]> => {
    const response = await api.get<HomepagePromotion[]>(
      "/promotions/homepage",
      { params: { limit } },
    );
    return response.data;
  },
};
