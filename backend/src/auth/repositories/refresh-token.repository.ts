import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}
  async create(data: {
    userId: number;
    tokenHash: string;
    tokenId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenEntity> {
    const refreshToken = this.refreshTokenRepository.create(data);

    return await this.refreshTokenRepository.save(refreshToken);
  }
  async findByTokenId(tokenId: string): Promise<RefreshTokenEntity | null> {
    return await this.refreshTokenRepository.findOne({
      where: { tokenId },
    });
  }
  async revoke(
    refreshTokenId: number,
    newRefreshTokenId: number,
  ): Promise<RefreshTokenEntity | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        id: refreshTokenId,
      },
    });

    if (!refreshToken) {
      return null;
    }

    refreshToken.revokedAt = new Date();
    refreshToken.replacedByTokenId = newRefreshTokenId;

    return await this.refreshTokenRepository.save(refreshToken);
  }
}
