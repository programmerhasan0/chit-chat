import { Controller, Post, Body } from '@nestjs/common';
import { ResetService } from './reset.service';
import { ResendOtpDto, ResetPasswordDto, VerifyOtpDto } from 'src/dto/auth.dto';

@Controller()
export class ResetController {
    constructor(private readonly resetService: ResetService) {}
    @Post('get-otp')
    async postGetResetOtp(@Body() resendOtpDto: ResendOtpDto) {
        return await this.resetService.postGetResetOtp(resendOtpDto);
    }

    @Post('verify-otp')
    async postVerifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return await this.resetService.postVerifyOtp(verifyOtpDto);
    }

    @Post('set-password')
    async postResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.resetService.postResetPassword(resetPasswordDto);
    }
}
