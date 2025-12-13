import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from 'src/generated/prisma/client';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GetProfileDto, LoginDto } from 'src/dto/auth.dto';
import { SessionService } from 'src/common/session/session.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
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
            throw new BadRequestException(
                'User already logged in from another device.',
            );
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

    async postLogout(req: Request): Promise<{ message: string }> {
        const userId = req.user?.id as number;
        await this.sessionService.removeSession(userId);
        return { message: 'user logged out successfully.' };
    }
}
