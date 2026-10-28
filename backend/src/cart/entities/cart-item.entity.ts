import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string;

  @Column({
    name: 'cart_id',
    type: 'bigint',
    unsigned: true,
    nullable: false,
  })
  cartId: string;

  @Column({
    name: 'variant_id',
    type: 'bigint',
    unsigned: true,
    nullable: false,
  })
  variantId: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
    default: 1,
  })
  quantity: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: false,
  })
  updatedAt: Date;
}
