import { AuthService } from './auth.service';
import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import type { LoginUserData } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  postLogin(@Body() userData: LoginUserData) {
    return this.authService.postLogin(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.authService.getProfile(req);
  }
  @Get('all')
  getAll() {
    return this.authService.getAll();
  }
}
