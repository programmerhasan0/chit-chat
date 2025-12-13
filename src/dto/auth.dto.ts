import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsString,
    Length,
    Matches,
    MinLength,
} from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';
import { Gender, Role } from 'src/generated/prisma/enums';

// dto for user registration
export class RegisterUserDto {
    @ApiProperty({
        name: 'email',
        example: 'programmerhasan0@gmail.com',
        description: 'email of the user',
    })
    @IsEmail()
    email: string;

    @ApiProperty({ name: 'name', example: 'Md H Hasan' })
    @IsNotEmpty({ message: 'name is required' })
    name: string;

    @ApiProperty({ name: 'role', enum: Role, example: Role.student })
    @IsEnum(Role)
    role: Role;
}

// dto for otp verification
export class VerifyOtpDto {
    @ApiProperty({
        name: 'email',
        example: 'programmerhasan0@gmail.com',
        description: 'email of the user',
    })
    @IsEmail()
    email: string;
    @ApiProperty({
        name: 'otp',
        example: '123456',
        description: 'a exact 6 digit numbers only value',
    })
    @IsNumberString({}, { message: 'OTP must contain only numbers' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp: string;
}

// dto for resending otp
export class ResendOtpDto {
    @ApiProperty({
        name: 'email',
        example: 'programmerhasan0@gmail.com',
        description: 'email of the user',
    })
    @IsEmail()
    email: string;
}

// dto for create or changing password
export class CreateOrChangePasswordDto {
    @ApiProperty({
        name: 'email',
        example: 'programmerhasan0@gmail.com',
        description: 'email of the user',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        name: 'password',
        example: 'StrongP@ssw0rd!1',
        description:
            'a string contains mimimum 8 characters, at least 1 uppercase, 1 lowsercase, 1 number and 1 special character.',
    })
    @IsString()
    @MinLength(8, { message: 'Password must be atleast 8 characters long.' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).+$/,
        {
            message:
                'Password must contain atleast 1 uppercase, 1 lowercase, 1 number and 1 special character.',
        },
    )
    password: string;

    @ApiProperty({
        name: 'confirmPassword',
        example: 'StrongP@ssw0rd!1',
        description: 'similar and exact match of the password field.',
    })
    @IsString()
    @Match('password', { message: 'Passwords do not match.' })
    confirmPassword: string;
}

// dto for updating profile after creating password
export class UpdateProfileDto {
    @ApiProperty({
        name: 'gender',
        enum: Gender,
        example: Gender.male,
        description: 'gender between male, female and others',
    })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({
        name: 'university',
        example: 'Uttara University',
        description: 'University name, if registering as a student.',
    })
    @IsString()
    @IsNotEmpty({ message: 'university must not be empty.' })
    university: string;

    @ApiProperty({
        name: 'dob',
        description: 'date of birth of the user',
        example: '2025-12-14T10:00:00.000Z',
        type: String,
        format: 'date-time',
    })
    @Type(() => Date)
    @IsDate({ message: 'date must be valid date.' })
    dob: Date;
}

// dto for setting password after reset
export class ResetPasswordDto extends CreateOrChangePasswordDto {
    @IsNumberString({}, { message: 'OTP must contain only numbers' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp: string;
}

// dto for login
export class LoginDto {
    @ApiProperty({
        example: 'programmerhasan0@gmail.com',
        description: 'Email address of the user',
        type: String,
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongP@ssw0rd!1',
        description: 'Password of the user',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

// dto for successful profile
export class GetProfileDto {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEnum(Role)
    role: Role;

    @ApiProperty()
    @IsBoolean()
    isVerified: boolean;

    @ApiProperty()
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty()
    @IsDate()
    dateOfBirth: Date;

    @ApiProperty()
    @IsString()
    university: string;
}
