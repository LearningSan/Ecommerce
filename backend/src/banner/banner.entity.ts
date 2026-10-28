import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('banners')
export class BannerEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'image_url',
  })
  imageUrl: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'mobile_image_url',
  })
  mobileImageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'link_url',
  })
  linkUrl: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  position: number;

  @Column({
    type: 'enum',
    enum: BannerStatus,
    default: BannerStatus.ACTIVE,
  })
  status: BannerStatus;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'start_at',
  })
  startAt: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'end_at',
  })
  endAt: Date | null;

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
