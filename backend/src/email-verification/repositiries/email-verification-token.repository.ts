import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationTokenEntity } from '../entities/email-verification-token.entity';
import { EntityManager, IsNull, Repository } from 'typeorm';

@Injectable()
export class EmailVerificationTokenRepository {
  constructor(
    @InjectRepository(EmailVerificationTokenEntity)
    private readonly emailVerificationTokenReposirory: Repository<EmailVerificationTokenEntity>,
  ) {}

  async create(
    data: {
      userId: number;
      tokenHash: string;
      expiresAt: Date;
    },
    manager?: EntityManager,
  ): Promise<EmailVerificationTokenEntity> {
    const repository = manager
      ? manager.getRepository(EmailVerificationTokenEntity)
      : this.emailVerificationTokenReposirory;

    const token = repository.create(data);

    return await repository.save(token);
  }
  async delete(userId:number,manager?:EntityManager){
    const repository= manager ? manager.getRepository(EmailVerificationTokenEntity) : this.emailVerificationTokenReposirory
    await repository.delete({
      userId,
      verifiedAt:IsNull()
    })
  }
  async findByTokenHash(
    tokenHash: string,
    manager?: EntityManager,
  ): Promise<EmailVerificationTokenEntity | null> {
    const repository = manager
      ? manager.getRepository(EmailVerificationTokenEntity)
      : this.emailVerificationTokenReposirory;

    return await repository.findOne({
      where: { tokenHash },
    });
  }

  async markAsVerified(id: number, manager?: EntityManager): Promise<void> {
    const repository = manager
      ? manager.getRepository(EmailVerificationTokenEntity)
      : this.emailVerificationTokenReposirory;
      
    await repository
      .createQueryBuilder()
      .update(EmailVerificationTokenEntity)
      .set({
        verifiedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }
}
