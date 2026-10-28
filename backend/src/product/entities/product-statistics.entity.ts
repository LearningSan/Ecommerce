import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_statistics')
export class ProductStatisticsEntity {
  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'product_id',
  })
  productId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    name: 'sold_quantity',
  })
  soldQuantity: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    name: 'buyer_count',
  })
  buyerCount: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    name: 'review_count',
  })
  reviewCount: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.0,
    name: 'rating_average',
  })
  ratingAverage: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    name: 'favorite_count',
  })
  favoriteCount: number;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
  })
  updatedAt: Date;
}
