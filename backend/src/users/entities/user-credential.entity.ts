import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';


@Entity('user_credentials')
export class UserCredentialEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    unique: true,
    name: 'user_id',
  })
  userId: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
  })
  passwordHash: string;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'password_changed_at',
  })
  passwordChangedAt: Date | null;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    name: 'failed_login_attempts',
  })
  failedLoginAttempts: number;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'locked_until',
  })
  lockedUntil: Date | null;

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

  @OneToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;
}
