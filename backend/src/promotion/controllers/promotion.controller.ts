import { Controller, Get, Query } from '@nestjs/common';

import { PromotionService } from '../services/promotion.service';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get('homepage')
  async getHomepagePromotions(@Query('limit') limit?: string) {
    return this.promotionService.findPromotions(
      limit ? Number(limit) : 6,
    );
  }
}
