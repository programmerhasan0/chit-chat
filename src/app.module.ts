import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import configuration from './config/configuration';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, ChatModule],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
