import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto } from 'src/types/dto/auth.dto';

@Injectable()
export class RegisterService {
  constructor(private readonly prisma: PrismaService) {}

  // service --> Register (responsible for user register)
  // route --> /auth/register
  async postRegister(
    registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    console.log('logging register dto : ', registerUserDto);

    const newUser = await this.prisma.user.create({
      data: {
        name: registerUserDto.name,
        email: registerUserDto.email,
        role: registerUserDto.role,
      },
    });

    if (newUser.id) {
      return {
        message: 'User created! A OTP has been sent for email verification.',
      };
    } else {
      throw new InternalServerErrorException();
    }
  }
}
