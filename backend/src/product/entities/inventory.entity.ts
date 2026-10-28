import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventories')
export class InventoryEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'warehouse_id',
  })
  warehouseId: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'variant_id',
  })
  variantId: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
  })
  quantity: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    name: 'reserved_quantity',
  })
  reservedQuantity: number;

  // available_quantity là cột GENERATED trong MySQL.
  // Không khai báo @Column để ghi dữ liệu vào cột này.

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
}
