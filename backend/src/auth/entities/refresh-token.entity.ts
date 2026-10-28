import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
  })
  userId: number;

  @Column({
    name: 'token_id',
    type: 'varchar',
    length: 64,
    unique: true,
  })
  tokenId: string;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
  })
  tokenHash: string;

  @Column({
    name: 'expires_at',
    type: 'datetime',
  })
  expiresAt: Date;

  @Column({
    name: 'revoked_at',
    type: 'datetime',
    nullable: true,
  })
  revokedAt: Date | null;

  @Column({
    name: 'replaced_by_token_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  replacedByTokenId: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;
}
