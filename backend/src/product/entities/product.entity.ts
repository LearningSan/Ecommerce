import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'category_id',
    nullable: false,
  })
  categoryId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'brand_id',
    nullable: true,
  })
  brandId: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type:'boolean',
    nullable:false,
    default:false,
    name:'is_featured'
  }) isFeatured:boolean

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE'],
    default: 'DRAFT',
    nullable: false,
  })
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'created_by',
    nullable: true,
  })
  createdBy: number | null;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'updated_by',
    nullable: true,
  })
  updatedBy: number | null;

  @Column({
    type: 'datetime',
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    name: 'updated_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'datetime',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date | null;
}
