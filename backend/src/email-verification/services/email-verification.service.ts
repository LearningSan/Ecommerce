import { Injectable } from '@nestjs/common';
import { MailService } from '../../mail/services/mail.service';
import { randomBytes, createHash } from 'crypto';
import { EmailVerificationTokenRepository } from '../repositiries/email-verification-token.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { EmailVerificationInvalidException } from '../exceptions/email-verification-invalid.exception';
import { EmailVerificationAlreadyUsedException } from '../exceptions/email-verification-already-used.exception';
import { EmailVerificationExpiredException } from '../exceptions/email-verification-expired.exception';
import { DataSource, EntityManager } from 'typeorm';
@Injectable()
export class EmailVerificationService {
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
  constructor(
    private readonly mailService: MailService,
    private readonly userRepository: UserRepository,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private readonly dataSource: DataSource,
  ) {}
  async createVerificationToken(
    userId: number,
    manager?: EntityManager,
  ): Promise<string> {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.emailVerificationTokenRepository.create(
      {
        userId,
        tokenHash,
        expiresAt,
      },
      manager,
    );

    return token;
  }
  async resendVerificationToken(userId: number): Promise<string> {
    await this.emailVerificationTokenRepository.delete(userId);

    return this.createVerificationToken(userId);
  }
  async sendVerificationEmail(data: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL}/email-verify?token=${encodeURIComponent(data.token)}`;
    await this.mailService.sendMail({
      to: data.email,

      subject: 'Xác thực email tài khoản',

      html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực Email</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td style="background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); height: 8px;"></td>
                </tr>
                <tr>
                  <td style="padding: 40px 32px; text-align: left;">     
                    <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 22px; font-weight: 700; line-height: 1.3;">
                      Xin chào ${data.name},
                    </h2>
                    <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 15px; line-height: 1.6;">
                      Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình thiết lập và bảo mật tài khoản của bạn, vui lòng xác nhận địa chỉ email này.
                    </p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); transition: background-color 0.2s;">
                            Xác nhận địa chỉ Email
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                      ⏱️ <strong>Lưu ý:</strong> Liên kết xác thực này sẽ hết hạn trong vòng <strong>15 phút</strong>.
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 13px; line-height: 1.5; border-top: 1px solid #F3F4F6; padding-top: 20px;">
                      Nếu bạn không thực hiện yêu cầu này, bạn có thể an tâm bỏ qua email này.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #F3F4F6;">
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} Ecommerce / Ứng Dụng. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    });
  }
  async sendComfirmResetPasswordEmail(data: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/password-reset-verify?token=${encodeURIComponent(data.token)}`;
    await this.mailService.sendMail({
      to: data.email,
      subject: 'Khôi phục mật khẩu tài khoản của bạn',
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #1976d2; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">
                    Đặt Lại Mật Khẩu
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; color: #333333; font-size: 15px; line-height: 1.6;">
                  <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #111111;">
                    Xin chào ${data.name},
                  </p>
                  <p style="margin-bottom: 24px; color: #555555;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng bấm vào nút bên dưới để tiến hành tạo mật khẩu mới.
                  </p>

                  <!-- Call to Action Button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #1976d2; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(25, 118, 210, 0.3);">
                          Đặt lại mật khẩu
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiration Note -->
                  <div style="background-color: #fff8e1; border-left: 4px solid #ffa000; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #b78103;">
                      ⏳ Liên kết này chỉ có hiệu lực trong <strong>15 phút</strong>.
                    </p>
                  </div>

                  <!-- Fallback Link -->
                  <p style="font-size: 12px; color: #777777; margin-bottom: 8px; word-break: break-all;">
                    Nếu nút bấm trên không hoạt động, bạn có thể sao chép và dán đường dẫn sau vào trình duyệt:
                  </p>
                  <p style="font-size: 12px; margin-top: 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #1976d2; text-decoration: underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 32px;">
                  <div style="border-top: 1px solid #eeeeee;"></div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px 32px 32px; background-color: #ffffff; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                  <p style="margin: 0 0 8px 0;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể an tâm bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
                  </p>
                  <p style="margin: 0; color: #aaaaaa;">
                    © ${new Date().getFullYear()} YourAppName. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
    });
  }
  async verifyEmail(token: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const tokenHash = this.hashToken(token);
      const verificationToken =
        await this.emailVerificationTokenRepository.findByTokenHash(
          tokenHash,
          manager,
        );
      if (!verificationToken) {
        throw new EmailVerificationInvalidException();
      }
      if (verificationToken.verifiedAt) {
        throw new EmailVerificationAlreadyUsedException();
      }
      if (verificationToken.expiresAt.getTime() < Date.now()) {
        throw new EmailVerificationExpiredException();
      }
      await this.userRepository.markEmailAsVerified(
        verificationToken.userId,
        manager,
      );
      await this.emailVerificationTokenRepository.markAsVerified(
        verificationToken.id,
        manager,
      );
    });
  }
}
