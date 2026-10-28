import { BadRequestException } from '@nestjs/common';
export class EmailVerificationInvalidException extends BadRequestException {
  constructor() {
    super('Liên kết xác thực không hợp lệ');
  }
}
