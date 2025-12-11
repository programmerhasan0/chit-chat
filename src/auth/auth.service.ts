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

export type LoginUserData = Omit<User, 'name' | 'id'>;

console.log('logged process variables : ', process.env.JWT_SECRET);

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    // service --> Login (responsible for user login)
    //route --> /auth/login
    async postLogin(
        userData: LoginUserData,
    ): Promise<{ access_token?: string; message?: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (!user) {
            throw new BadRequestException();
        }

        if (user?.id) {
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
                String(userData.password),
            );

            if (isPasswordMatch) {
                // actions for login
                const payload = { id: user.id, email: user.email };

                return {
                    access_token: this.jwtService.sign(payload),
                };
            } else {
                // unauthorized for wrong password
                throw new UnauthorizedException('Wrong Password');
            }
        } else {
            // Handling user not found error
            throw new NotFoundException('User not found');
        }
    }

    // TODO: getAll Route only for dev purposes. must be removed in prod.

    // service --> get all users (responsible for viewing all users)
    // route --> /auth/all
    async getAll(): Promise<Omit<User, 'password' | 'hasPassword'>[]> {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                otp: true,
                otpExpire: true,
                isVerified: true,
                gender: true,
                dateOfBirth: true,
                university: true,
                lastOtpRequestedAt: true,
            },
        });
        return users;
    }

    async getProfile(req: Request): Promise<{
        id: number | string;
        email: string;
        name: string;
    }> {
        const userFromClient = req.user;

        const userFromDb = await this.prisma.user.findUnique({
            where: { id: userFromClient?.id },
            select: { id: true, name: true, email: true },
        });

        if (userFromDb?.id) {
            return userFromDb;
        } else {
            throw new NotFoundException('User Not Found');
        }
    }
}
