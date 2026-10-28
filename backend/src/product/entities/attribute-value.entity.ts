import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('attribute_values')
export class AttributeValueEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'attribute_id',
  })
  attributeId: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  value: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'color_hex',
  })
  colorHex: string | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'sort_order',
  })
  sortOrder: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;
}
