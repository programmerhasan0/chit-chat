import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly mailFrom = `Chit Chat - programmerhasanprojects@gmail.com`;

  private transporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public async SendVerifyMail(mailto: string, otp: string) {
    const html = this.getOtpTemplate().replace(`{{OTP}}`, otp);

    const mail = await this.transporter().sendMail({
      from: this.mailFrom,
      to: mailto,
      subject: 'Email Verification - Chit Chat',
      html,
    });
    //
    console.log('logging the message id : ', mail.messageId);
    return mail.messageId;
  }

  //helper --> get otp template
  private getOtpTemplate(): string {
    const filePath = path.join(process.cwd(), 'src', 'templates', 'otp.html');
    console.log('logging the file path : ', filePath);
    return fs.readFileSync(filePath, 'utf-8');
  }
}
