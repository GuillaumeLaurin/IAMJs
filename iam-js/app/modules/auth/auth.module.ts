import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { Session } from '@auth/entities/session.entity';
import { RedisModule } from '@redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

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
  providers: [],
  exports: [],
})
export class AuthModule {}
