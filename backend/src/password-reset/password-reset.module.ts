import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PasswordResetController } from './controllers/password-reset.controller';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import { PasswordResetEntity } from './entities/password-reset.entity';

import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { QueueModule } from '../common/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetEntity]),
    MailModule,
    UsersModule,
    QueueModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, PasswordResetRepository],
})
export class PasswordResetModule {}
