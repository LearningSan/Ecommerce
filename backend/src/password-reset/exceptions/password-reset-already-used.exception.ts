import { BadRequestException } from '@nestjs/common';

export class PasswordResetAlreadyUsedException extends BadRequestException {
  constructor() {
    super('Password reset token has already been used.');
  }
}
