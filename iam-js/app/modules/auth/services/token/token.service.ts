import { TokenPair } from '@auth/interfaces/token-pair.interface';
import { Payload } from '@auth/interfaces/payload.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@app/modules/redis/redis.module';
import { UserService } from '@app/modules/user/services/user/user.service';
import { v4 as uuidv4 } from 'uuid';

const KEY = {
  refreshToken: (userId: string): string => `refresh:${userId}`,
  blacklist: (jti: string): string => `blacklist:${jti}`,
};

const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async generateTokenPair(userId: string): Promise<TokenPair> {
    const user = await this.userService.findOne(userId);

    const jti = uuidv4();

    const payload: Payload = {
      sub: userId,
      tokenVersion: user.tokenVersion,
      jti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    await this.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async rotateTokens(userId: string, incomingToken: string): Promise<TokenPair> {
    const storedHash = await this.redis.get(KEY.refreshToken(userId));

    if (!storedHash) {
      throw new UnauthorizedException('Session expired or not found');
    }

    const isValid = await verify(storedHash, incomingToken);

    if (!isValid) {
      await this.revokeAllTokens(userId);
      throw new UnauthorizedException('Invalid token, every sessions are revoked');
    }

    await this.redis.del(KEY.refreshToken(userId));

    return this.generateTokenPair(userId);
  }

  async blacklistAccessToken(jti: string, exp: number): Promise<void> {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return;
    await this.redis.set(KEY.blacklist(jti), '1', 'EX', ttl);
  }

  async isAccessTokenBlacklisted(jti: string): Promise<boolean> {
    return (await this.redis.exists(KEY.blacklist(jti))) === 1;
  }

  async revokeAllTokens(userId: string): Promise<void> {
    await Promise.all([
      this.redis.del(KEY.refreshToken(userId)),
      this.userService.incremetTokenVersion(userId),
    ]);
  }

  async verifyAccessToken(token: string): Promise<Payload> {
    return this.jwtService.verifyAsync<Payload>(token, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN'),
    });
  }

  async verifyRefreshToken(token: string): Promise<Payload> {
    return this.jwtService.verifyAsync<Payload>(token, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN'),
    });
  }

  private async signAccessToken(payload: Payload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN'),
      expiresIn: `${ACCESS_TTL_SEC}`,
    });
  }

  private async signRefreshToken(payload: Payload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN'),
      expiresIn: `${REFRESH_TTL_SEC}`,
    });
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const h = await hash(token);
    await this.redis.set(KEY.refreshToken(userId), h, 'EX', REFRESH_TTL_SEC);
  }
}
