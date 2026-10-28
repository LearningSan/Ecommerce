import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BannerEntity, BannerStatus } from './banner.entity';

export interface BannerListItem {
  id: number;
  title: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  position: number;
}

@Injectable()
export class BannerRepository {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly repository: Repository<BannerEntity>,
  ) {}

  async findActive(): Promise<BannerListItem[]> {
    const now = new Date();

    return this.repository
      .createQueryBuilder('banner')
      .select([
        'banner.id',
        'banner.title',
        'banner.imageUrl',
        'banner.mobileImageUrl',
        'banner.linkUrl',
        'banner.position',
      ])
      .where('banner.status = :status', {
        status: BannerStatus.ACTIVE,
      })
      .andWhere('(banner.startAt IS NULL OR banner.startAt <= :now)', { now })
      .andWhere('(banner.endAt IS NULL OR banner.endAt >= :now)', { now })
      .orderBy('banner.position', 'ASC')
      .addOrderBy('banner.id', 'ASC')
      .getMany();
  }
}
