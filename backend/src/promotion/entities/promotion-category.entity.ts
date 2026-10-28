import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('promotion_categories')
export class PromotionCategoryEntity {
  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'promotion_id',
  })
  promotionId: number;

  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'category_id',
  })
  categoryId: number;
}
