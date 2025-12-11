import { Module } from '@nestjs/common';
import { ResetService } from './reset.service';
import { ResetController } from './reset.controller';
import { PrismaService } from 'src/prisma.service';
import { OtpService } from 'src/common/otp/otp.service';
import { MailService } from 'src/common/mail/mail.service';

@Module({
    providers: [ResetService, PrismaService, OtpService, MailService],
    controllers: [ResetController],
})
export class ResetModule {}
