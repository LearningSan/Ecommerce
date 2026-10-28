import { Module } from '@nestjs/common';
import { PromotionService } from './services/promotion.service';
import { PromotionController } from './controllers/promotion.controller';
import { PromotionRepository } from './repositories/promotion.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { PromotionCategoryEntity } from './entities/promotion-category.entity';
import { PromotionBuyXGetYEntity } from './entities/promotion-buy-x-get-y.entity';
import { PromotionProductEntity } from './entities/promotion-product.entity';
import { PromotionTierEntity } from './entities/promotion-tier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromotionEntity,
      PromotionCategoryEntity,
      PromotionBuyXGetYEntity,
      PromotionProductEntity,
      PromotionTierEntity,
    ]),
  ],
  providers: [PromotionService, PromotionRepository],
  controllers: [PromotionController],
  exports: [PromotionService],
})
export class PromotionModule {}
