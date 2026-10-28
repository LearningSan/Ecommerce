import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('brands')
export class BrandEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 180,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'logo_url',
    nullable: true,
  })
  logoUrl: string | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    nullable: false,
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

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
