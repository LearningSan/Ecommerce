import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { PasswordResetService } from '../services/password-reset.service';

import { PasswordResetDto } from '../dto/password-reset.dto';
import { ResetPasswordConfirmDto } from '../dto/password-reset-confirm.dto';
import { RateLimit } from '../../common/rate-limit/decorators/rate-limit.decorator';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('request')
  @RateLimit('sensitive')
  async request(@Body() dto: PasswordResetDto) {
    await this.passwordResetService.forgotPassword(dto);

    return {
      message: 'Đã gửi email đặt lại mật khẩu.',
    };
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token không được để trống');
    }

    await this.passwordResetService.validateResetToken(token);

    return {
      valid: true,
    };
  }

  @Post('confirm')
  @RateLimit('sensitive')
  async confirm(@Body() dto: ResetPasswordConfirmDto) {
    await this.passwordResetService.resetPassword(dto);

    return {
      message: 'Đặt lại mật khẩu thành công',
    };
  }
}
