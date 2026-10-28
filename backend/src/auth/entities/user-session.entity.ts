import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RefreshTokenEntity } from './refresh-token.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'user_id',
  })
  userId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: 'refresh_token_id',
  })
  refreshTokenId: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'device_name',
  })
  deviceName: string | null;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    name: 'ip_address',
  })
  ipAddress: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'user_agent',
  })
  userAgent: string | null;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'last_used_at',
  })
  lastUsedAt: Date | null;

  @Column({
    type: 'datetime',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'revoked_at',
  })
  revokedAt: Date | null;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;

  @ManyToOne(() => RefreshTokenEntity, {
    nullable: true,
  })
  @JoinColumn({
    name: 'refresh_token_id',
  })
  refreshToken: RefreshTokenEntity | null;
}
