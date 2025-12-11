import { Controller, Post, Body } from '@nestjs/common';
import { ResetService } from './reset.service';
import { ResendOtpDto } from 'src/dto/auth.dto';

@Controller('auth/reset')
export class ResetController {
    constructor(private readonly resetService: ResetService) {}
    @Post('get-otp')
    async postGetResetOtp(@Body() resendOtpDto: ResendOtpDto) {
        return await this.resetService.postGetResetOtp(resendOtpDto);
    }
}
