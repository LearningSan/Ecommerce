import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PromotionTierDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

@Entity('promotion_tiers')
export class PromotionTierEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'promotion_id',
  })
  promotionId: number;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'min_quantity',
  })
  minQuantity: number;

  @Column({
    type: 'enum',
    enum: PromotionTierDiscountType,
    name: 'discount_type',
  })
  discountType: PromotionTierDiscountType;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'discount_value',
  })
  discountValue: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'max_discount_amount',
  })
  maxDiscountAmount: number | null;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;
}