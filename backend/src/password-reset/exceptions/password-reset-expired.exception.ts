import { BadRequestException } from '@nestjs/common';

export class PasswordResetExpiredException extends BadRequestException {
  constructor() {
    super('Password reset token has expired.');
  }
}