import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('product_images')
export class ProductImageEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'product_id',
  })
  productId: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
    name: 'image_url',
  })
  imageUrl: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'alt_text',
  })
  altText: string | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'sort_order',
  })
  sortOrder: number;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_primary',
  })
  isPrimary: boolean;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;
}
