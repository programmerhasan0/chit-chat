import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
    GetProfileDto,
    LoginDto,
    RemoveDeviceDto,
    RequestRemoveDeviceOtpDto,
} from 'src/dto/auth.dto';
import { SessionService } from 'src/common/session/session.service';
import { OtpService } from 'src/common/otp/otp.service';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
        private readonly otp: OtpService,
        private readonly mail: MailService,
    ) {}

    // service --> Login (responsible for user login)
    //route --> /auth/login
    async postLogin(
        loginDto: LoginDto,
        userAgent: string,
        ip?: string,
    ): Promise<{ access_token?: string; message?: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        // checking if the user exists or not
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // checking if the user is verified or not
        if (!user.isVerified) {
            throw new BadRequestException(
                'You are not verified! Please verify yourself',
            );
        }

        // checking is the user created his password or not
        if (!user.hasPassword || !user.password) {
            throw new BadRequestException(
                'You have not created your password. Please create first.',
            );
        }

        // verifying the password is correct or not
        const isPasswordMatch = await argon2.verify(
            user.password,
            String(loginDto.password),
        );

        // unauthorized for wrong password
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Wrong Password');
        }

        // checking if the users is already logged from another device or not.
        const isLoggedIn = await this.sessionService.isUserLoggedIn(user.id);
        if (isLoggedIn) {
            throw new BadRequestException({
                message: 'Already logged in into another device.',
                info: isLoggedIn,
            });
        }

        // actions for login
        // creating jwt
        const payload = { id: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);

        // creating session
        await this.sessionService.createSession(
            user.id,
            access_token,
            userAgent,
            ip,
        );

        return { access_token };
    }

    // TODO: getAll Route only for dev purposes. must be removed in prod.

    // service --> get all users (responsible for viewing all users)
    // route --> /auth/all
    async getAll(): Promise<GetProfileDto[]> {
        const users = (await this.prisma.user.findMany({
            omit: {
                password: true,
                otp: true,
                otpExpire: true,
                lastOtpRequestedAt: true,
                hasPassword: true,
            },
        })) as GetProfileDto[];
        return users;
    }

    async getProfile(req: Request): Promise<GetProfileDto> {
        const userFromClient = req.user;

        const userFromDb = (await this.prisma.user.findUnique({
            where: { id: userFromClient?.id },
            omit: {
                password: true,
                otp: true,
                otpExpire: true,
                lastOtpRequestedAt: true,
                hasPassword: true,
            },
        })) as GetProfileDto;

        if (userFromDb?.id) {
            return userFromDb;
        } else {
            throw new NotFoundException('User Not Found');
        }
    }

    async postGetRemoveDeviceOtp(
        requestRemoveDeviceOtpDto: RequestRemoveDeviceOtpDto,
    ): Promise<{ message: string }> {
        const session = await this.sessionService.findSession(
            requestRemoveDeviceOtpDto.id,
            requestRemoveDeviceOtpDto.userId,
        );

        // generate otp and send via email
        const otp = await this.otp.genOtp();

        const updateSessionWithOtp = await this.sessionService.asignOtp(
            otp.otpHash,
            otp.expire,
            session.id,
            session.userId,
        );

        // checking if otp assignment is successful or not.
        if (!updateSessionWithOtp) throw new InternalServerErrorException();

        const mailSent = await this.mail.sendRemoveDeviceOtp(
            session.user.email,
            otp.otp,
        );

        if (!mailSent) throw new InternalServerErrorException();
        return {
            message:
                'An OTP has been sent to your email for remove device request.',
        };
    }

    async postRemoveDevice(
        removeDeviceDto: RemoveDeviceDto,
    ): Promise<{ message: string }> {
        const session = await this.sessionService.findSession(
            removeDeviceDto.id,
            removeDeviceDto.userId,
        );

        const isOtpValid = await argon2.verify(
            session.otp as string,
            removeDeviceDto.otp,
        );

        if (!isOtpValid) throw new BadRequestException('Invalid OTP');

        if (isOtpValid && new Date() > session.otpExpire!) {
            throw new BadRequestException('OTP expired');
        }

        const removedDevice = await this.sessionService.removeSession(
            session.userId,
        );

        if (!removedDevice) throw new InternalServerErrorException();

        return { message: 'Device removed successfully.' };
    }

    async postLogout(req: Request): Promise<{ message: string }> {
        const userId = req.user?.id as number;
        await this.sessionService.removeSession(userId);
        return { message: 'user logged out successfully.' };
    }
}
