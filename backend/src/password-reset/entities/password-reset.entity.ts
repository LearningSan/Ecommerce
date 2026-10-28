import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetEntity {
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
    type: 'varchar',
    length: 255,
    unique: true,
    name: 'token_hash',
  })
  tokenHash: string;

  @Column({
    type: 'datetime',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: 'datetime',
    name: 'used_at',
    nullable: true,
  })
  usedAt: Date | null;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;
}
