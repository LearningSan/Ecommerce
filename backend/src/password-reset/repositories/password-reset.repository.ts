import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetEntity } from '../entities/password-reset.entity';
import { EntityManager, IsNull, Repository } from 'typeorm';

@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordResetEntity)
    private readonly passwordResetRepository: Repository<PasswordResetEntity>,
  ) {}
  async create(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  },manager?:EntityManager): Promise<PasswordResetEntity> {
    const repository= manager ? manager.getRepository(PasswordResetEntity) : this.passwordResetRepository
    const passwordReset = repository.create({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
    });

    return repository.save(passwordReset);
  }
  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetEntity | null> {
    return this.passwordResetRepository.findOne({
      where: {
        tokenHash,
      },
    });
  }
  async invalidateUserTokens(userId: number,manager?:EntityManager): Promise<void> {
    const repository= manager ? manager.getRepository(PasswordResetEntity) : this.passwordResetRepository
    await repository.update(
      {
        userId,
        usedAt: IsNull(),
      },
      {
        usedAt: new Date(),
      },
    );
  }
  async markAsUsed(id: number): Promise<void> {
    await this.passwordResetRepository.update(
      {
        id,
      },
      {
        usedAt: new Date(),
      },
    );
  }
}
