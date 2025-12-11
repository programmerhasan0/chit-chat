import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/common/mail/mail.service';
import { OtpService } from 'src/common/otp/otp.service';

@Module({
    controllers: [RegisterController],
    providers: [RegisterService, PrismaService, MailService, OtpService],
})
export class RegisterModule {}
