import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  ORDER_THRESHOLD = 'ORDER_THRESHOLD',
  FREE_SHIPPING = 'FREE_SHIPPING',
  TIERED = 'TIERED',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
}

export enum PromotionDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PromotionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity('promotions')
export class PromotionEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  description: string | null;

  @Column({
  type: 'varchar',
  length: 500,
  nullable: true,
  name: 'promotion_image',
})
promotionImage: string | null;

  @Column({
    type: 'enum',
    enum: PromotionType,
    name: 'promotion_type',
  })
  promotionType: PromotionType;

  @Column({
    type: 'enum',
    enum: PromotionDiscountType,
    name: 'discount_type',
    nullable: true,
  })
  discountType: PromotionDiscountType | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'discount_value',
  })
  discountValue: number | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'max_discount_amount',
  })
  maxDiscountAmount: number | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'minimum_order_amount',
  })
  minimumOrderAmount: number | null;

  @Column({
    type: 'datetime',
    name: 'start_at',
  })
  startAt: Date;

  @Column({
    type: 'datetime',
    name: 'end_at',
  })
  endAt: Date;

  @Column({
    type: 'enum',
    enum: PromotionStatus,
    default: PromotionStatus.DRAFT,
  })
  status: PromotionStatus;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: 'created_by',
  })
  createdBy: number | null;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: 'updated_by',
  })
  updatedBy: number | null;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'datetime',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date | null;
}