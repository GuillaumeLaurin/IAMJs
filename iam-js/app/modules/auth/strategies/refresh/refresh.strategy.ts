import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Payload } from '@auth/interfaces/payload.interface';

interface ValidatedUser extends Payload {
  refreshToken: string;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null =>
          (req?.cookies as Record<string, string | undefined>)?.refresh_token ?? null,
        ExtractJwt.fromBodyField('refreshToken'),
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN')!,
      passReqToCallback: true as const,
    });
  }

  validate(req: Request, payload: Payload): ValidatedUser {
    const cookies = req.cookies as Record<string, string | undefined>;
    const body = req.body as Record<string, string | undefined>;

    const refreshToken = cookies.refresh_token ?? body.refreshToken;

    if (!refreshToken) throw new UnauthorizedException();

    return { ...payload, refreshToken };
  }
}
