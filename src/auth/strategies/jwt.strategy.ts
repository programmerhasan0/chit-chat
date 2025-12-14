import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { SessionService } from 'src/common/session/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly session: SessionService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET!,
        });
    }

    async validate(payload: { id: string | number; email: string }) {
        const isValidSession = await this.session.isUserLoggedIn(+payload.id);

        if (!isValidSession)
            throw new UnauthorizedException('Please login first.');

        return payload;
    }
}
