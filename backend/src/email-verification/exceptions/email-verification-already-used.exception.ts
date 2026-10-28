import { BadRequestException } from '@nestjs/common';
export class EmailVerificationAlreadyUsedException extends BadRequestException {
  constructor() {
    super('Liên kết xác thực đã được sử dụng');
  }
}
