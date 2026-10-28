import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserOAuthAccountEntity } from '../entities/user-oauth-account.entity';

@Injectable()
export class OAuthAccountRepository {
  constructor(
    @InjectRepository(UserOAuthAccountEntity)
    private readonly oauthAccountRepository: Repository<UserOAuthAccountEntity>,
  ) {}

  async findByProviderAccount(
    provider: 'GOOGLE' | 'FACEBOOK',
    providerAccountId: string,
  ): Promise<UserOAuthAccountEntity | null> {
    return await this.oauthAccountRepository.findOne({
      where: {
        provider,
        providerAccountId,
      },
    });
  }

  async findByUserAndProvider(
    userId: number,
    provider: 'GOOGLE' | 'FACEBOOK',
  ): Promise<UserOAuthAccountEntity | null> {
    return await this.oauthAccountRepository.findOne({
      where: {
        userId,
        provider,
      },
    });
  }

  async create(data: {
    userId: number;
    provider: 'GOOGLE' | 'FACEBOOK';
    providerAccountId: string;
    providerEmail: string;
  }): Promise<UserOAuthAccountEntity> {
    const oauthAccount = this.oauthAccountRepository.create({
      userId: data.userId,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      providerEmail: data.providerEmail,
      status: 'ACTIVE',
      linkedAt: new Date(),
      lastLoginAt: new Date(),
    });

    return await this.oauthAccountRepository.save(oauthAccount);
  }

  async updateLastLogin(
    oauthAccountId: number,
  ): Promise<UserOAuthAccountEntity> {
    const oauthAccount = await this.oauthAccountRepository.findOne({
      where: {
        id: oauthAccountId,
      },
    });

    if (!oauthAccount) {
      throw new NotFoundException('OAuth account not found');
    }

    oauthAccount.lastLoginAt = new Date();

    return await this.oauthAccountRepository.save(oauthAccount);
  }
}
