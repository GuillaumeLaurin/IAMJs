import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { Session } from '@auth/entities/session.entity';
import { RedisModule } from '@redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from '@auth/services/token/token.service';
import { AuthService } from '@auth/services/auth/auth.service';
import { AccessStrategy } from '@auth/strategies/access/access.strategy';
import { RefreshStrategy } from '@auth/strategies/refresh/refresh.strategy';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RefreshGuard } from '@auth/guards/refresh.guard';
import { AuthController } from '@auth/controllers/auth/auth.controller';
import { GoogleStrategy } from '@auth/strategies/google/google.strategy';
import { GithubStrategy } from '@auth/strategies/github/github.strategy';
import { GoogleGuard } from '@auth/guards/google.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Session]),
    UserModule,
    PassportModule,
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    AuthService,
    AccessStrategy,
    RefreshStrategy,
    AuthGuard,
    RefreshGuard,
    GoogleStrategy,
    GithubStrategy,
    GoogleGuard,
    GoogleStrategy,
  ],
  exports: [TokenService, AuthService, RefreshGuard, AuthGuard, GoogleGuard, GoogleStrategy],
})
export class AuthModule {}
