import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service';
import {
  CreateOrChangePasswordDto,
  RegisterUserDto,
  ResendOtpDto,
  VerifyOtpDto,
} from 'src/dto/auth.dto';

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

  @Post('resend-otp')
  async postResendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return await this.registerService.postResendOtp(resendOtpDto);
  }

  @Post('create-password')
  async postCreatePassword(
    @Body() createPasswordDto: CreateOrChangePasswordDto,
  ) {
    return await this.registerService.postCreatePassword(createPasswordDto);
  }
}
