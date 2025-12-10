import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto, VerifyOtpDto } from 'src/dto/auth.dto';
import { MailService } from 'src/common/mail/mail.service';
import { OtpService } from 'src/common/otp/otp.service';
import { isArgon2Hash } from 'src/helpers/argon2';

@Injectable()
export class RegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly otp: OtpService,
  ) {}

  // service --> Register (responsible for user register)
  // route --> /auth/register/email
  async postRegister(
    registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    console.log('logging register dto : ', registerUserDto);

    const otpData = await this.otp.genOtp();

    const newUser = await this.prisma.user.create({
      data: {
        name: registerUserDto.name,
        email: registerUserDto.email,
        role: registerUserDto.role,
        otp: otpData.otpHash,
        otpExpire: otpData.expire,
      },
    });

    if (newUser.id) {
      const sentMail = await this.mail.SendVerifyMail(
        newUser.email,
        otpData.otp,
      );

      if (sentMail.length > 0) {
        return { message: 'User created! Otp has been sent to your email' };
      }
    }

    throw new InternalServerErrorException();
  }

  // service --> verify otp (responsible for verifying otp from the users)
  // route /auth/register/verify
  async postVerifyEmail(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (isArgon2Hash(user.otp)) {
      // verifying the otp
      const isOtpValid = await this.otp.isOtpValid(user.otp!, verifyOtpDto.otp);

      if (isOtpValid) {
        // checking validity of the otp
        const currentDate = new Date();
        const otpExpireDate = new Date(user.otpExpire!);
        if (currentDate.getTime() > otpExpireDate.getTime()) {
          throw new BadRequestException('OTP expired');
        }

        const updatedVerifiedStatus = await this.prisma.user.update({
          where: { email: verifyOtpDto.email },
          data: { isVerified: true, otp: null, otpExpire: null },
        });

        if (updatedVerifiedStatus.isVerified) {
          return { message: 'User Verified! Please create password now.' };
        }
      } else {
        throw new BadRequestException('Wrong OTP');
      }
    }
    throw new InternalServerErrorException(
      'Something went wrong. Please Request a new OTP.',
    );
  }
}
