import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from 'src/common/mail/mail.service';
import { OtpService } from 'src/common/otp/otp.service';
import { ResendOtpDto, ResetPasswordDto, VerifyOtpDto } from 'src/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import * as argon2 from 'argon2';

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

        const lastOtpRequestTime = user?.lastOtpRequestedAt as Date;
        const nextAllowedTime = new Date(
            lastOtpRequestTime?.getTime() + 60 * 1000,
        );

        if (new Date() < nextAllowedTime) {
            throw new BadRequestException(
                'Please wait 1 minute before sending a new otp request.',
            );
        }

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

    // service --> verify otp (responsible for getting password reset otps)
    // route /auth/reset/verify-otp
    async postVerifyOtp(
        verifyOtpDto: VerifyOtpDto,
    ): Promise<{ message: string; status: boolean }> {
        const user = await this.prisma.user.findUnique({
            where: { email: verifyOtpDto.email },
        });

        if (!user) throw new NotFoundException('User not found');

        const isOtpValid = await this.otp.isOtpValid(
            user.otp!,
            verifyOtpDto.otp,
        );
        const otpExpire = user.otpExpire as Date;

        if (!isOtpValid)
            throw new ForbiddenException({
                message: 'Wrong OTP',
                status: false,
            });

        if (isOtpValid && new Date().getTime() > otpExpire.getTime()) {
            throw new ForbiddenException({
                message: 'OTP Expired',
                status: false,
            });
        }

        if (isOtpValid && new Date().getTime() < otpExpire.getTime()) {
            return { message: 'Valid', status: true };
        }

        return { message: 'Invalid OTP.', status: false };
    }

    // service --> set new password (responsible for setting password after verifying the otp)
    // route /auth/reset/set-password
    async postResetPassword(
        resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        // No need to validate the OTP separately because this.postVerifyOtp() will automatically send a response if the OTP is invalid or expired.
        const isValidOtp = await this.postVerifyOtp({
            email: resetPasswordDto.email,
            otp: resetPasswordDto.otp,
        });

        // If the program reaches here, that means the OTP is valid, still checking the validity of the otp for linting causes.
        if (isValidOtp.status) {
            const hashedPassword = await argon2.hash(resetPasswordDto.password);
            const updatedUser = await this.prisma.user.update({
                where: { email: resetPasswordDto.email },
                data: {
                    password: hashedPassword,
                    otp: null,
                    otpExpire: null,
                },
            });
            if (updatedUser.id) {
                return { message: 'Password Updated. Please login.' };
            }
        }

        throw new InternalServerErrorException();
    }
}
