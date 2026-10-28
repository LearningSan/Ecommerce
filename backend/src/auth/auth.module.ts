import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';

import { UserJwtConfig } from './config/user-jwt.config';
import { AuthService } from './services/auth.service';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';

import { UserAuthController } from './controllers/user-auth.controller';

import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserSessionEntity } from './entities/user-session.entity';
import { UserOAuthAccountEntity } from './entities/user-oauth-account.entity';

import { UserSessionRepository } from './repositories/user-session.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { OAuthAccountRepository } from './repositories/user-oauth-account.repository';

import { UsersModule } from '../users/users.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { RateLimitModule } from '../common/rate-limit/rate-limit.module';
import { QueueModule } from '../common/queue/queue.module';
import { UserJwtGuard } from './guards/user-jwt.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({}),

    TypeOrmModule.forFeature([
      RefreshTokenEntity,
      UserSessionEntity,
      UserOAuthAccountEntity,
    ]),
    PassportModule.register({
      defaultStrategy: 'user-jwt',
    }),
    UsersModule,
    EmailVerificationModule,
    RateLimitModule,
    QueueModule,
  ],

  controllers: [UserAuthController],

  providers: [
    AuthService,
    UserSessionRepository,
    RefreshTokenRepository,
    OAuthAccountRepository,
    UserJwtConfig,
    UserJwtStrategy,
    {
      provide: OAuth2Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(
          configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
          configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
          configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
        );
      },
    },
  ],
  exports: [PassportModule],
})
export class AuthModule {}
