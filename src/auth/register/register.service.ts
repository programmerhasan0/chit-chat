import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
    CreateOrChangePasswordDto,
    RegisterUserDto,
    ResendOtpDto,
    UpdateProfileDto,
    VerifyOtpDto,
} from 'src/dto/auth.dto';
import { MailService } from 'src/common/mail/mail.service';
import { OtpService } from 'src/common/otp/otp.service';
import { isArgon2Hash } from 'src/helpers/argon2';
import * as argon2 from 'argon2';
import type { Request } from 'express';

@Injectable()
export class RegisterService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailService,
        private readonly otp: OtpService,
    ) {}

    // service --> Register (responsible for user register)
    // route --> /auth/register/email
    async postRegister(
        registerUserDto: RegisterUserDto,
    ): Promise<{ message: string }> {
        console.log('logging register dto : ', registerUserDto);

        const otpData = await this.otp.genOtp();

        const newUser = await this.prisma.user.create({
            data: {
                name: registerUserDto.name,
                email: registerUserDto.email,
                role: registerUserDto.role,
                otp: otpData.otpHash,
                otpExpire: otpData.expire,
                lastOtpRequestedAt: new Date(),
            },
        });

        if (newUser.id) {
            const sentMail = await this.mail.SendVerifyMail(
                newUser.email,
                otpData.otp,
            );

            if (sentMail.length > 0) {
                return {
                    message: 'User created! Otp has been sent to your email',
                };
            }
        }

        throw new InternalServerErrorException();
    }

    // service --> verify otp (responsible for verifying otp from the users)
    // route /auth/register/verify
    async postVerifyEmail(
        verifyOtpDto: VerifyOtpDto,
    ): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: verifyOtpDto.email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (isArgon2Hash(user.otp)) {
            // verifying the otp
            const isOtpValid = await this.otp.isOtpValid(
                user.otp!,
                verifyOtpDto.otp,
            );

            if (isOtpValid && user.otpExpire) {
                // checking validity of the otp
                const currentDate = new Date();
                if (currentDate.getTime() > user.otpExpire?.getTime()) {
                    throw new BadRequestException('OTP expired');
                }

                const updatedVerifiedStatus = await this.prisma.user.update({
                    where: { email: verifyOtpDto.email },
                    data: { isVerified: true, otp: null, otpExpire: null },
                });

                if (updatedVerifiedStatus.isVerified) {
                    return {
                        message: 'User Verified! Please create password now.',
                    };
                }
            } else {
                throw new BadRequestException('Wrong OTP');
            }
        }
        throw new InternalServerErrorException(
            'Something went wrong. Please Request a new OTP.',
        );
    }

    // service --> resend otp (responsible for generating and sending the otp at 1 minute interval)
    // route /auth/register/resend-otp
    async postResendOtp(
        resendOtpDto: ResendOtpDto,
    ): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: resendOtpDto.email },
        });

        if (!user) throw new NotFoundException('User not found');
        if (user.isVerified) {
            throw new UnauthorizedException(
                'Not allowed to access this route.',
            );
        }

        const last = user.lastOtpRequestedAt as Date;
        const nextAllowedTime = new Date(last?.getTime() + 60 * 1000);

        if (new Date() < nextAllowedTime) {
            throw new BadRequestException(
                'Please wait at least 1 minute before requesting a new OTP.',
            );
        }

        // Generating new otp
        const newOtp = await this.otp.genOtp();
        const updateWithOtp = await this.prisma.user.update({
            where: { email: user.email },
            data: {
                otp: newOtp.otpHash,
                otpExpire: newOtp.expire,
                lastOtpRequestedAt: new Date(),
            },
        });

        if (updateWithOtp.id) {
            await this.mail.SendVerifyMail(user.email, newOtp.otp);
            return { message: 'OTP sent. Check your inbox.' };
        }

        throw new InternalServerErrorException();
    }

    // service --> create password (responsible for creating password upon successful registration and email verification)
    // route /auth/register/create-password
    async postCreatePassword(
        createPasswordDto: CreateOrChangePasswordDto,
    ): Promise<{ message }> {
        const user = await this.prisma.user.findUnique({
            where: { email: createPasswordDto.email },
        });

        if (!user)
            throw new NotFoundException('User not found. Please Register.');
        if (user.password && isArgon2Hash(user.password)) {
            throw new UnauthorizedException(
                'Not allowed to access this route.',
            );
        }

        const hashedPassword = await argon2.hash(createPasswordDto.password);

        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, hasPassword: true },
        });

        if (updatedUser.id) {
            return { message: 'Password created! You can login now.' };
        }

        throw new InternalServerErrorException();
    }

    // service --> update profile (responsible for updating profile upon successful registion, verification and password creation.)
    // route /auth/register/update-profile
    // Note: users should be logged in before updating their profile.
    async postUpdateProfile(
        updateProfileDto: UpdateProfileDto,
        req: Request,
    ): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user?.id },
        });

        if (!user) {
            throw new NotFoundException('User not found. Please register');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                university: updateProfileDto.university,
                gender: updateProfileDto.gender,
                dateOfBirth: updateProfileDto.dob,
            },
        });

        if (updatedUser.id) {
            return { message: 'User updated.' };
        }

        throw new InternalServerErrorException();
    }
}
