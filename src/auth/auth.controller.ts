import { AuthService } from './auth.service';
import {
    Body,
    Controller,
    Post,
    Get,
    UseGuards,
    Req,
    Headers,
    Ip,
} from '@nestjs/common';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import type { Request } from 'express';
import { LoginDto } from 'src/dto/auth.dto';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    postLogin(
        @Body() loginDto: LoginDto,
        // @Headers('user-agent') userAgent: string,
        @Ip() ip?: string,
    ) {
        return this.authService.postLogin(loginDto, 'unknown', ip);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access_token')
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @Get('profile')
    getProfile(@Req() req: Request) {
        return this.authService.getProfile(req);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access_token')
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    logout(@Req() req: Request) {
        return this.authService.postLogout(req);
    }

    // TODO: this route is only for dev purpose, must be removed in production build
    @Get('all')
    getAll() {
        return this.authService.getAll();
    }
}
