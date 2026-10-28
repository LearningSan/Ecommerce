import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductVariantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('product_variants')
export class ProductVariantEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'product_id',
  })
  productId: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  sku: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  price: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'compare_at_price',
  })
  compareAtPrice: string | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'cost_price',
  })
  costPrice: string | null;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    name: 'weight_grams',
  })
  weightGrams: number | null;

  @Column({
    type: 'enum',
    enum: ProductVariantStatus,
    default: ProductVariantStatus.ACTIVE,
  })
  status: ProductVariantStatus;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: 'created_by',
  })
  createdBy: string | null;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: 'updated_by',
  })
  updatedBy: string | null;

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

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt: Date | null;
}
