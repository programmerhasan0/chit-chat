import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto } from 'src/dto/auth.dto';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class RegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // service --> Register (responsible for user register)
  // route --> /auth/register
  async postRegister(
    registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    console.log('logging register dto : ', registerUserDto);
    const otp = this.genOtp();

    const newUser = await this.prisma.user.create({
      data: {
        name: registerUserDto.name,
        email: registerUserDto.email,
        role: registerUserDto.role,
        otp,
      },
    });

    if (newUser.id) {
      const sentMail = await this.mail.SendVerifyMail(newUser.email, otp);

      if (sentMail.length > 0) {
        return { message: 'User created! Otp has been sent to your email' };
      }
      throw new InternalServerErrorException();
    } else {
      throw new InternalServerErrorException();
    }
  }

  // helper --> generate otp
  private genOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }
}
