import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_oauth_accounts')
export class UserOAuthAccountEntity {
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
    type: 'enum',
    enum: ['GOOGLE', 'FACEBOOK'],
  })
  provider: 'GOOGLE' | 'FACEBOOK';

  @Column({
    name: 'provider_account_id',
    type: 'varchar',
    length: 255,
  })
  providerAccountId: string;

  @Column({
    name: 'provider_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerEmail: string | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'DISABLED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'DISABLED';

  @Column({
    name: 'linked_at',
    type: 'datetime',
  })
  linkedAt: Date;

  @Column({
    name: 'unlinked_at',
    type: 'datetime',
    nullable: true,
  })
  unlinkedAt: Date | null;

  @Column({
    name: 'last_login_at',
    type: 'datetime',
    nullable: true,
  })
  lastLoginAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date;
}
