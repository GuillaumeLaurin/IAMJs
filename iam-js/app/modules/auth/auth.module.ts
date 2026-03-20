import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { Session } from '@auth/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    UserModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuthModule {}
