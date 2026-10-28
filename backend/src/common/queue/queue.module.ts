import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailProcessor } from './processors/email.processor';
import { EmailQueueService } from './queues/email.queue';
import { MailModule } from '../../mail/mail.module';
import { EmailVerificationModule } from '../../email-verification/email-verification.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'email',
    }),
    EmailVerificationModule,
    MailModule,
  ],

  providers: [EmailProcessor, EmailQueueService],

  exports: [EmailQueueService],
})
export class QueueModule {}
