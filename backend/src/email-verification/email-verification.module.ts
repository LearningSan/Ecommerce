import { Module } from '@nestjs/common';
import { EmailVerificationTokenController } from './controllers/email-verification-token.controller';
import { EmailVerificationService } from './services/email-verification.service';
import { EmailVerificationTokenRepository } from './repositiries/email-verification-token.repository';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationTokenEntity } from './entities/email-verification-token.entity';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    UsersModule,
    MailModule,
    UsersModule,
    TypeOrmModule.forFeature([EmailVerificationTokenEntity]),
  ],

  controllers: [EmailVerificationTokenController],

  providers: [EmailVerificationService, EmailVerificationTokenRepository],

  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
