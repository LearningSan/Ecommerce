import { BadRequestException, Controller, Post, Body } from '@nestjs/common';

import { EmailVerificationService } from '../services/email-verification.service';
import { RateLimit } from '../../common/rate-limit/decorators/rate-limit.decorator';

@Controller('auth/user')
export class EmailVerificationTokenController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('verify-email')
  @RateLimit('auth')
  async verify(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token không được để trống');
    }

    await this.emailVerificationService.verifyEmail(token);

    return {
      message: 'Xác thực email thành công',
    };
  }
}
