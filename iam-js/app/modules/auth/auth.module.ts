import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { Session } from '@auth/entities/session.entity';
import { RedisModule } from '@redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './services/token/token.service';
import { AuthService } from './services/auth/auth.service';
import { AccessStrategy } from './strategies/access/access.strategy';
import { RefreshStrategy } from './strategies/refresh/refresh.strategy';
import { AuthGuard } from './guards/auth.guard';
import { RefreshGuard } from './guards/refresh.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Session]),
    UserModule,
    PassportModule,
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [],
  providers: [TokenService, AuthService, AccessStrategy, RefreshStrategy, AuthGuard, RefreshGuard],
  exports: [TokenService, AuthService, AccessStrategy, RefreshGuard, AuthGuard, RefreshGuard],
})
export class AuthModule {}
