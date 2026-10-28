import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PromotionEntity, PromotionStatus } from '../entities/promotion.entity';

@Injectable()
export class PromotionRepository {
  constructor(
    @InjectRepository(PromotionEntity)
    private readonly repository: Repository<PromotionEntity>,
  ) {}

  async findPromotions(limit = 6): Promise<PromotionEntity[]> {
    return this.repository
      .createQueryBuilder('promotion')
      .select(['promotion.id', 'promotion.name', 'promotion.promotionImage'])
      .where('promotion.status = :status', {
        status: PromotionStatus.ACTIVE,
      })
      .andWhere('promotion.start_at <= NOW()')
      .andWhere('promotion.end_at > NOW()')
      .orderBy('promotion.start_at', 'DESC')
      .take(limit)
      .getMany();
  }
}
