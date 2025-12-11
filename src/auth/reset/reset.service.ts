import { Injectable } from '@nestjs/common';
import { MailService } from 'src/common/mail/mail.service';
import { OtpService } from 'src/common/otp/otp.service';
import { ResendOtpDto } from 'src/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ResetService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otp: OtpService,
        private readonly mail: MailService,
    ) {}

    // service --> get reset otp (responsible for getting password reset otps)
    // route /auth/reset/get-otp
    async postGetResetOtp(
        resendOtpDto: ResendOtpDto,
    ): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: resendOtpDto.email },
        });

        if (user?.id) {
            const otp = await this.otp.genOtp();

            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    otp: otp.otpHash,
                    otpExpire: otp.expire,
                    lastOtpRequestedAt: new Date(),
                },
            });

            if (updatedUser.id) {
                const mailSend = await this.mail.sendForgetPasswordOtp(
                    updatedUser.email,
                    otp.otp,
                );
                console.log(mailSend);
            }
        }

        return {
            message:
                'A OTP has been sent if we found your email on our database.',
        };
    }
}
