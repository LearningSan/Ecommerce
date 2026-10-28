import { Injectable } from '@nestjs/common';
import * as nodemailder from 'nodemailer';
@Injectable()
export class MailService {
  private readonly transporter = nodemailder.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  async sendMail(data: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
