import { PromotionDiscountType, PromotionType } from "../entities/promotion.entity";


export class PromotionDto {
  id: number;
  name: string;
  description: string | null;

  promotionType: PromotionType;

  discountType: PromotionDiscountType | null;
  discountValue: number | null;
  maxDiscountAmount: number | null;

  minimumOrderAmount: number | null;

  startAt: Date;
  endAt: Date;
}