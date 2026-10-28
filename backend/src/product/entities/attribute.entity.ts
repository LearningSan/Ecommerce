import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AttributeType {
  TEXT = 'TEXT',
  COLOR = 'COLOR',
  SELECT = 'SELECT',
}

@Entity('attributes')
export class AttributeEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  code: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
    default: AttributeType.SELECT,
  })
  type: AttributeType;

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
}
