import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Role } from '@user/entities/role.entity';
import { Permission } from '@user/entities/permission.entity';
import { PermissionSeeder } from '@user/seeders/permission/permission.seeder';
import { RoleSeeder } from '@user/seeders/role/role.seeder';
import { PermissionService } from '@user/services/permission/permission.service';
import { RoleService } from '@user/services/role/role.service';
import { UserService } from '@user/services/user/user.service';
import { RoleGuard } from '@user/guards/role/role.guard';
import { PermissionGuard } from '@user/guards/permission/permission.guard';
import { UserMiddleware } from '@user/middlewares/user/user.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [],
  providers: [
    PermissionSeeder,
    RoleSeeder,
    PermissionService,
    RoleService,
    UserService,
    RoleGuard,
    PermissionGuard,
    UserMiddleware,
  ],
  exports: [
    PermissionService,
    RoleService,
    UserService,
    RoleGuard,
    PermissionGuard,
    UserMiddleware,
  ],
})
export class UserModule {}
