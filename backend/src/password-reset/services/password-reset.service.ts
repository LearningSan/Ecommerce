import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PasswordResetExpiredException } from '../exceptions/password-reset-expired.exception';
import { PasswordResetAlreadyUsedException } from '../exceptions/password-reset-already-used.exception';
import { PasswordResetInvalidException } from '../exceptions/password-reset-invalid.exception';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { MailService } from '../../mail/services/mail.service';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { ResetPasswordConfirmDto } from '../dto/password-reset-confirm.dto';
import { DataSource } from 'typeorm';
import { EmailQueueService } from '../../common/queue/queues/email.queue';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly dataSource: DataSource,
    private readonly emailQueueService: EmailQueueService,
  ) {}
  async forgotPassword(dto: PasswordResetDto): Promise<void> {
    if (!dto.email) {
      throw new BadRequestException('Vui lòng nhập email');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findByEmail(dto.email);

      if (!user) {
        throw new BadRequestException('Không tìm thấy tài khoản với email này');
      }

      const token = randomBytes(32).toString('hex');

      const tokenHash = createHash('sha256').update(token).digest('hex');

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.passwordResetRepository.invalidateUserTokens(user.id, manager);

      await this.passwordResetRepository.create(
        {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
        manager,
      );

      return {
        email: user.email,
        name: user.name,
        token,
      };
    });

    // Transaction đã COMMIT thành công
    await this.emailQueueService.addConfirmPasswordResetEmail({
      email: result.email,
      name: result.name,
      token: result.token,
    });
  }
  async validateResetToken(token: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const resetToken =
      await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new PasswordResetInvalidException();
    }

    if (resetToken.usedAt) {
      throw new PasswordResetAlreadyUsedException();
    }

    if (resetToken.expiresAt < new Date()) {
      throw new PasswordResetExpiredException();
    }
  }
  
  async resetPassword(dto: ResetPasswordConfirmDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }
    
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetToken =
      await this.passwordResetRepository.findByTokenHash(tokenHash);
    if (!resetToken) {
      throw new BadRequestException('Token đặt lại mật khẩu không hợp lệ');
    }
    if (resetToken.usedAt) {
      throw new BadRequestException('Token đặt lại mật khẩu đã được sử dụng');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token đặt lại mật khẩu đã hết hạn');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(resetToken.userId, passwordHash);
    await this.passwordResetRepository.markAsUsed(resetToken.id);
  }
}
