import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterUserDto, VerifyOtpDto } from 'src/dto/auth.dto';

@Controller('auth/register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('email')
  async postRegisterByEmail(@Body() registerUserDto: RegisterUserDto) {
    return await this.registerService.postRegister(registerUserDto);
  }

  @Post('verify')
  async postVerifyEmail(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.registerService.postVerifyEmail(verifyOtpDto);
  }
}
