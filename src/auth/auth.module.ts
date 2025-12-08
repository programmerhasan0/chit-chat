import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { jwtConstants } from './constants';

console.log(typeof jwtConstants.secret);

@Module({
  imports: [
    JwtModule.register({
      secretOrPrivateKey: jwtConstants.secret,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PrismaService, JwtService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
