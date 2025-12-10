import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  Length,
} from 'class-validator';

export enum Role {
  STUDENT = 'student',
  FACULTY = 'faculty',
  RECRUITER = 'recruiter',
  PRO_PARTNER = 'pro partner',
}

// dto for user registration
export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsEnum(Role)
  role: Role;
}

// dto for otp verification
export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNumberString({}, { message: 'OTP must contain only numbers' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
