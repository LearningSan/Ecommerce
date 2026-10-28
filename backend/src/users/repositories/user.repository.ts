import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserStatus } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { UserCredentialEntity } from '../entities/user-credential.entity';
export interface UserLoginResult {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserEntity['status'];
  lockedUntil: Date | null;
  failedLoginAttempts: number;
  passwordHash: string;
  emailVerifiedAt: Date | null;
}
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserCredentialEntity)
    private readonly userCredentialRepository: Repository<UserCredentialEntity>,
  ) {}

  async findUserForLogin(identifier: string): Promise<UserLoginResult | null> {
    const result = await this.userRepository
      .createQueryBuilder('u')
      .innerJoin(UserCredentialEntity, 'c', 'c.user_id=u.id')
      .select([
        'u.id AS id',
        'u.name AS name',
        'u.email AS email',
        'u.phone AS phone',
        'u.status AS status',
        'u.email_verified_at AS emailVerifiedAt',
        'c.locked_until AS lockedUntil',
        'c.failed_login_attempts AS failedLoginAttempts',
        'c.password_hash AS passwordHash',
      ])
      .where('u.email = :identifier OR u.phone = :identifier', {
        identifier,
      })
      .limit(1)
      .getRawOne<UserLoginResult>();

    return result ?? null;
  }

  async lockUser(
    userId: number,
    lockedUntil: Date,
    failedLoginAttempts: number,
  ): Promise<void> {
    await this.userCredentialRepository
      .createQueryBuilder()
      .update(UserCredentialEntity)
      .set({ lockedUntil, failedLoginAttempts })
      .where('user_id=:userId', { userId })
      .execute();
  }
  async updateFailedAttemps(userId: number, failedLoginAttempts: number) {
    await this.userCredentialRepository
      .createQueryBuilder()
      .update(UserCredentialEntity)
      .set({ failedLoginAttempts })
      .where('user_id= :userId', { userId })
      .execute();
  }
  async resetFailedAttemps(userId: number) {
    await this.userCredentialRepository
      .createQueryBuilder()
      .update(UserCredentialEntity)
      .set({ failedLoginAttempts: 0 })
      .where('user_id= :userId', { userId })
      .execute();
  }
  async findByUserId(userId: number): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
  async findByPhone(phone: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: {
        phone,
      },
    });
  }
  async createUser(
    data: {
      email: string;
      phone: string | null;
      name: string;
      avatarUrl?: string | null;
      emailVerifiedAt?: Date | null;
    },
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const repository = manager
      ? manager.getRepository(UserEntity)
      : this.userRepository;

    const user = repository.create({
      email: data.email,
      phone: data.phone ?? null,
      name: data.name,
      avatarUrl: data.avatarUrl ?? null,
      emailVerifiedAt: data.emailVerifiedAt ?? null,
      status: UserStatus.ACTIVE,
    });

    return await repository.save(user);
  }
  async createCredential(
    data: {
      userId: number;
      passwordHash: string;
    },
    manager?: EntityManager,
  ): Promise<UserCredentialEntity> {
    const repository = manager
      ? manager.getRepository(UserCredentialEntity)
      : this.userCredentialRepository;

    const credential = repository.create({
      userId: data.userId,
      passwordHash: data.passwordHash,
      passwordChangedAt: new Date(),
    });

    return repository.save(credential);
  }
  async markEmailAsVerified(
    userId: number,
    manager: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(UserEntity)
      : this.userRepository;
    await repository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        emailVerifiedAt: new Date(),
      })
      .where('id = :userId', { userId })
      .execute();
  }
  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.userCredentialRepository.update(
      {
        id: userId,
      },
      {
        passwordHash,
      },
    );
  }
}
