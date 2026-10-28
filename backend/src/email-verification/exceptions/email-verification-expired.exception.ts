import { BadRequestException } from '@nestjs/common';
export class EmailVerificationExpiredException extends BadRequestException {
  constructor() {
    super('Liên kết xác thực đã hết hạn');
  }
}
