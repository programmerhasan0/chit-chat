import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/common/mail/mail.service';
// import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService, PrismaService, MailService],
})
export class RegisterModule {}
