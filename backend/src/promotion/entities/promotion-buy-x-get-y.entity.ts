import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('promotion_buy_x_get_y')
export class PromotionBuyXGetYEntity {
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
    type: 'bigint',
    unsigned: true,
    name: 'buy_variant_id',
  })
  buyVariantId: number;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'buy_quantity',
  })
  buyQuantity: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'reward_variant_id',
  })
  rewardVariantId: number;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'reward_quantity',
  })
  rewardQuantity: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;
}
