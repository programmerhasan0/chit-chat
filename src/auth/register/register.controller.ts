import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterService } from './register.service';
import {
    CreateOrChangePasswordDto,
    RegisterUserDto,
    ResendOtpDto,
    UpdateProfileDto,
    VerifyOtpDto,
} from 'src/dto/auth.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import type { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
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

    @ApiBearerAuth('access_token')
    @UseGuards(JwtAuthGuard)
    @Post('update-profile')
    async postUpdateProfile(
        @Body() updateProfileDto: UpdateProfileDto,
        @Req() req: Request,
    ) {
        return await this.registerService.postUpdateProfile(
            updateProfileDto,
            req,
        );
    }
}
