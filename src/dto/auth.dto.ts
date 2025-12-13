import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
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

// dto for resending otp
export class ResendOtpDto {
    @IsEmail()
    email: string;
}

// dto for create or changing password
export class CreateOrChangePasswordDto {
    @IsEmail()
    email: string;

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

    @IsString()
    @Match('password', { message: 'Passwords do not match.' })
    confirmPassword: string;
}

// dto for updating profile after creating password
export class UpdateProfileDto {
    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    @IsNotEmpty({ message: 'university must not be empty.' })
    university: string;

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
        example: 'StrongP@ssw0rd!',
        description: 'Password of the user',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
