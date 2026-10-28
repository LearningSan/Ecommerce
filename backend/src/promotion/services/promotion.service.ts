import { Injectable } from '@nestjs/common';

import { PromotionRepository } from '../repositories/promotion.repository';
import { PromotionListItem } from '../types/promotion-list-item';

@Injectable()
export class PromotionService {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async findPromotions(limit = 6): Promise<PromotionListItem[]> {
    const promotions = await this.promotionRepository.findPromotions(limit);

    return promotions.map((promotion) => ({
      id: promotion.id,
      name: promotion.name,
      promotionImage: promotion.promotionImage,
    }));
  }
}
