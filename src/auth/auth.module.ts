import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { RegisterModule } from './register/register.module';
import { ResetModule } from './reset/reset.module';
import { SessionService } from 'src/common/session/session.service';
import { OtpService } from 'src/common/otp/otp.service';
import { MailService } from 'src/common/mail/mail.service';
import { RouterModule } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot(),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
        RegisterModule,
        ResetModule,
        RouterModule.register([
            {
                path: 'auth',
                module: AuthModule,
                children: [
                    {
                        path: 'register',
                        module: RegisterModule,
                    },
                    {
                        path: 'reset',
                        module: ResetModule,
                    },
                ],
            },
        ]),
    ],
    providers: [
        AuthService,
        PrismaService,
        JwtStrategy,
        SessionService,
        OtpService,
        MailService,
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
