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

    // sending email verification otp
    public async SendVerifyMail(mailto: string, otp: string) {
        const html = this.getVerifyEmailOtpTemplate().replace(`{{OTP}}`, otp);

        const mail = await this.transporter().sendMail({
            from: this.mailFrom,
            to: mailto,
            subject: 'Email Verification - Chit Chat',
            html,
        });
        return mail.messageId;
    }

    // sending forget password otp
    public async sendForgetPasswordOtp(mailto: string, otp: string) {
        const html = this.getMultiPurposeOtpTemplate().replace(`{{OTP}}`, otp);

        const mail = await this.transporter().sendMail({
            from: this.mailFrom,
            to: mailto,
            subject: 'Password Reset - Chit Chat',
            html,
        });

        return mail.messageId;
    }

    // sending remove device otp
    public async sendRemoveDeviceOtp(mailto: string, otp: string) {
        const html = this.getMultiPurposeOtpTemplate().replace(`{{OTP}}`, otp);

        const mail = await this.transporter().sendMail({
            from: this.mailFrom,
            to: mailto,
            subject: 'Remove Device Request - Chit Chat',
            html,
        });

        return mail.messageId;
    }

    //helper --> get verify_email template
    private getVerifyEmailOtpTemplate(): string {
        const filePath = path.join(
            process.cwd(),
            'src',
            'templates',
            'verify_email.html',
        );
        console.log('logging the file path : ', filePath);
        return fs.readFileSync(filePath, 'utf-8');
    }

    //helper --> get forget_password template
    private getMultiPurposeOtpTemplate(): string {
        const filePath = path.join(
            process.cwd(),
            'src',
            'templates',
            'multipurpose_otp.html',
        );
        return fs.readFileSync(filePath, 'utf-8');
    }
}
