
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('warehouses')
export class WarehouseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'address_line',
  })
  addressLine: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  province: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  district: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  ward: string | null;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE,
  })
  status: WarehouseStatus;

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