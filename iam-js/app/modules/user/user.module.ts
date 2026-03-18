import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PermissionSeeder } from './seeders/permission/permission.seeder';
import { RoleSeeder } from './seeders/role/role.seeder';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Permission]),
    ],
    controllers: [],
    providers: [
        PermissionSeeder,
        RoleSeeder,
    ],
    exports: [],
})
export class UserModule {}