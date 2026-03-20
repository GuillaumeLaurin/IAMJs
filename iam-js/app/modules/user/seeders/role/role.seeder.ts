import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@user/entities/role.entity';
import { Repository } from 'typeorm';
import { Permission } from '@user/entities/permission.entity';
import { ROLES } from '@user/consts/role.const';

interface SeedingInterface {
  id?: number;
  isNew: boolean;
  needsUpdate: boolean;
  name: string;
  permissions: string[];
}

interface SeedingReport {
  updatedRoles: number;
  createdRoles: number;
  skippedRoles: number;
}

@Injectable()
export class RoleSeeder implements OnApplicationBootstrap {
  private logger: Logger = new Logger(RoleSeeder.name);

  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const permissions = await this.permissionsRepository.find();

    const savedPermissions = new Map<string, Permission>();
    permissions.forEach((permission) => {
      savedPermissions.set(permission.name, permission);
    });

    const roles = await this.rolesRepository.find();

    const mappedRoles = new Map<string, SeedingInterface>();
    roles.forEach((role) => {
      mappedRoles.set(role.name, {
        id: role.id,
        isNew: false,
        needsUpdate: false,
        name: role.name,
        permissions: role.permissions.map((permission) => permission.name),
      });
    });

    ROLES.forEach((role) => {
      const foundRole = mappedRoles.get(role.name);

      if (foundRole) {
        if (!this.compareArray(role.permissions, foundRole.permissions)) {
          foundRole.needsUpdate = true;
          foundRole.permissions = role.permissions;
        }
      } else {
        mappedRoles.set(role.name, {
          isNew: true,
          needsUpdate: false,
          name: role.name,
          permissions: role.permissions,
        });
      }
    });

    const rolesToCreate = Array.from(mappedRoles.values()).filter((val) => val.isNew === true);

    const rolesToUpdate = Array.from(mappedRoles.values()).filter(
      (val) => val.needsUpdate === true,
    );

    const seedingReport: SeedingReport = {
      updatedRoles: 0,
      createdRoles: 0,
      skippedRoles: 0,
    };

    seedingReport.skippedRoles = roles.length ? roles.length - rolesToUpdate.length : 0;

    this.logger.log('Update Roles Repository');

    // Process updates and creates concurrently with Promise.all
    await Promise.all(
      rolesToUpdate.map(async (role) => {
        const perms = role.permissions
          .map((val) => savedPermissions.get(val))
          .filter((perm): perm is Permission => perm !== undefined);
        await this.rolesRepository.update({ id: role.id }, { permissions: perms });
        seedingReport.updatedRoles += 1;
      }),
    );

    await Promise.all(
      rolesToCreate.map(async (role) => {
        const perms = role.permissions
          .map((val) => savedPermissions.get(val))
          .filter((perm): perm is Permission => perm !== undefined);
        await this.rolesRepository.save({
          name: role.name,
          permissions: perms,
        });
        seedingReport.createdRoles += 1;
      }),
    );

    this.logger.log('Update completed');
    this.logger.log(`Roles skipped: ${seedingReport.skippedRoles}`);
    this.logger.log(`Roles created: ${seedingReport.createdRoles}`);
    this.logger.log(`Roles updated: ${seedingReport.updatedRoles}`);
  }

  private compareArray<T>(a: T[], b: T[]): boolean {
    return a.every((element) => b.includes(element));
  }
}
