import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('promotion_products')
export class PromotionProductEntity {
  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'promotion_id',
  })
  promotionId: number;

  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'product_id',
  })
  productId: number;
}
