import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Session } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { OtpService } from '../otp/otp.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otp: OtpService,
        private readonly mail: MailService,
    ) {}

    //creating a Session
    public async createSession(
        userId: number,
        jwt: string,
        userAgent: string,
        ip?: string,
    ): Promise<Session> {
        const currentDate = new Date();
        const expiresAt = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        // checking if a session is already exists
        const existingSession = await this.prisma.session.findUnique({
            where: { userId: userId },
        });

        // check if the session exists and is still valid
        if (existingSession && existingSession.expiredAt > new Date()) {
            throw new BadRequestException(
                'You are already logged in from another device.',
            );
        }

        // checking if the session exists and expired, then remvoe it
        if (existingSession && new Date() > existingSession.expiredAt) {
            await this.removeSession(userId);
        }

        return this.prisma.session.create({
            data: {
                userId,
                jwt,
                userAgent,
                ip,
                expiredAt: expiresAt,
            },
        });
    }

    //removing a Session
    public async removeSession(userId: number) {
        // since using single device login, so used deleteMany here. however If we allow user to login from multiple devices, then we have to use delete with sessionId and delete a single session whenever we try to logout
        const removedSession = await this.prisma.session.delete({
            where: { userId },
        });
        if (!removedSession) {
            throw new NotFoundException('Session not found');
        }

        return removedSession;
    }

    // TODO (programmerhasan0): added functionality to log out with otp....

    public async asignOtp(
        otpHash: string,
        otpExpire: Date,
        id: number,
        userId: number,
    ) {
        return this.prisma.session.update({
            where: { id, userId },
            data: {
                otp: otpHash,
                otpExpire,
            },
        });
    }

    //check session validity
    public async isUserLoggedIn(
        userId: number,
    ): Promise<Pick<Session, 'id' | 'userId' | 'userAgent' | 'ip'> | boolean> {
        const session = await this.prisma.session.findUnique({
            where: { userId },
            select: {
                id: true,
                userId: true,
                userAgent: true,
                ip: true,
            },
        });

        console.log(session);

        if (!session) return false;
        return session;
    }

    // helper --> find session
    public async findSession(id: number, userId: number) {
        const session = await this.prisma.session.findUnique({
            where: { id, userId },
            include: { user: true },
        });

        if (!session) throw new NotFoundException('No session found');

        if (!session.otp) throw new NotFoundException('No session found.');

        return session;
    }
}
