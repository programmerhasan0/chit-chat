import { IsEmail, IsNotEmpty } from 'class-validator';

export enum Role {
  STUDENT = 'student',
  FACULTY = 'faculty',
  RECRUITER = 'recruiter',
  PRO_PARTNER = 'pro partner',
}

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'name is required' })
  name: string;

  role: Role;
}
