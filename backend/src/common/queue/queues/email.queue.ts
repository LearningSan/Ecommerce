import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
  ) {}

  async addVerificationEmail(data: {
    email: string;
    name: string;
    token: string;
  }) {
    await this.emailQueue.add('send-verification-email', data, {
      attempts: 3,

      backoff: {
        type: 'exponential',
        delay: 3000,
      },

      removeOnComplete: true,

      removeOnFail: false,
    });
  }
   async addConfirmPasswordResetEmail(data: {
    email: string;
    name: string;
    token: string;
  }) {
    await this.emailQueue.add('send-password-reset-email', data, {
      attempts: 3,

      backoff: {
        type: 'exponential',
        delay: 3000,
      },

      removeOnComplete: true,

      removeOnFail: false,
    });
  }
}
