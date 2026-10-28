import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailVerificationService } from '../../../email-verification/services/email-verification.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly mailVerifyService: EmailVerificationService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'send-verification-email':
        await this.handleVerificationEmail(job);
        break;
      case 'send-password-reset-email':
        await this.handleSendResetConfirm(job);
        break;
      default:
        throw new Error(`Unknown email job: ${job.name}`);
    }
  }

  private async handleVerificationEmail(job: Job): Promise<void> {
    const { email, name, token } = job.data;

    await this.mailVerifyService.sendVerificationEmail({
      email,
      name,
      token,
    });
  }
  private async handleSendResetConfirm(job: Job): Promise<void> {
    const { email, name, token } = job.data;
    await this.mailVerifyService.sendComfirmResetPasswordEmail({
      email,
      name,
      token,
    });
  }
}
