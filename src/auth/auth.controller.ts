import { AuthService } from './auth.service';
import { Body, Controller, Post, Get } from '@nestjs/common';
import type { UserData, LoginUserData } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  postRegister(@Body() userData: UserData) {
    return this.authService.postRegister(userData);
  }

  @Post('login')
  postLogin(@Body() userData: LoginUserData) {
    return this.authService.postLogin(userData);
  }

  @Get('all')
  getAll() {
    return this.authService.getAll();
  }
}
