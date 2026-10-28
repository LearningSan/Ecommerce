import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSessionEntity } from '../entities/user-session.entity';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly repository: Repository<UserSessionEntity>,
  ) {}

  async create(data: {
    userId: number;
    refreshTokenId: number;
    expiresAt: Date;
  }): Promise<UserSessionEntity> {
    const session = this.repository.create(data);

    return await this.repository.save(session);
  }
  async findByRefreshTokenId(
    refreshTokenId: number,
  ): Promise<UserSessionEntity | null> {
    return await this.repository.findOne({
      where: { refreshTokenId },
    });
  }
  async updateLastUsedAt(sessionId: number): Promise<void> {
    await this.repository.update(
      { id: sessionId },
      {
        lastUsedAt: new Date(),
      },
    );
  }
  async updateRefreshTokenId(
    sessionId: number,
    refreshTokenId: number,
  ): Promise<void> {
    await this.repository.update(
      { id: sessionId },
      {
        refreshTokenId,
      },
    );
  }
}
