import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PermissionSeeder } from './seeders/permission/permission.seeder';
import { RoleSeeder } from './seeders/role/role.seeder';
import { PermissionService } from './services/permission/permission.service';
import { RoleService } from './services/role/role.service';
import { UserService } from './services/user/user.service';
import { RoleGuard } from './guards/role/role.guard';
import { PermissionGuard } from './guards/permission/permission.guard';

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
  ],
  exports: [
    PermissionService,
    RoleService,
    UserService,
    RoleGuard,
    PermissionGuard,
  ],
})
export class UserModule {}
