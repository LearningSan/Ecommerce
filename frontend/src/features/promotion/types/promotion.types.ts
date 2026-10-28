export type PromotionType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "ORDER_THRESHOLD"
  | "FREE_SHIPPING"
  | "TIERED"
  | "BUY_X_GET_Y";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface HomepagePromotion {
  id: number;
  name: string;
  promotionImage: string | null;
}
export interface HomepagePromotionResponse {
  data: HomepagePromotion[];
}
