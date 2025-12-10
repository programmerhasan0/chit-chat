import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterUserDto } from 'src/dto/auth.dto';

@Controller('auth/register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('/email')
  async postRegisterByEmail(@Body() registerUserDto: RegisterUserDto) {
    return await this.registerService.postRegister(registerUserDto);
  }
}
