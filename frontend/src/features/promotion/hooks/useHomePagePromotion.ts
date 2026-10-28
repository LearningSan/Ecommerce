import { useQuery } from "@tanstack/react-query";

import { promotionService } from "../services/promotion.service";

export const useHomepagePromotions = (limit = 6) => {
  return useQuery({
    queryKey: ["promotions", "homepage", limit],
    queryFn: () =>
      promotionService.getHomepagePromotions(limit),
  });
};