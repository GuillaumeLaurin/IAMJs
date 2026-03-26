import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '@app/modules/user/services/user/user.service';
import { TokenService } from '@auth/services/token/token.service';
import { Payload } from '@auth/interfaces/payload.interface';
import { ConfigService } from '@nestjs/config';
import { User } from '@app/modules/user/entities/user.entity';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload): Promise<User> {
    const blacklisted = await this.tokenService.isAccessTokenBlacklisted(payload.jti);

    if (blacklisted) throw new UnauthorizedException('Revoked token');

    const user = await this.userService.findOne(payload.sub);

    if (!user) throw new UnauthorizedException();

    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Invalid session');
    }

    return user;
  }
}
