import { AuthService } from './auth.service';
import { Body, Controller, Post, Get } from '@nestjs/common';
import type { UserData } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  postRegister(@Body() userData: UserData) {
    return this.authService.postRegister(userData);
  }

  @Get('all')
  getAll() {
    return this.authService.getAll();
  }
}
