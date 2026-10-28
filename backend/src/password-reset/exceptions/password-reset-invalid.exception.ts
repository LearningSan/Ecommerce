import { BadRequestException } from '@nestjs/common';

export class PasswordResetInvalidException extends BadRequestException {
  constructor() {
    super('Password reset token is invalid.');
  }
}