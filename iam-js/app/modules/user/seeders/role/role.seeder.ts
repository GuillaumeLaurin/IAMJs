import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@user/entities/role.entity';
import { Repository } from 'typeorm';
import { Permission } from '@user/entities/permission.entity';
import { ROLES } from '@user/consts/role.const';

const SEPARATOR = `===================================================`;

interface SeedingInterface {
  id?: number;
  isNew: boolean;
  needsUpdate: boolean;
  keepIt: boolean;
  name: string;
  permissions: string[];
}

interface DeleteResult {
  id: number;
  name: string;
  affected?: number | null;
}

interface SeedingReport {
  deletedRoles: number;
  updatedRoles: number;
  createdRoles: number;
  skippedRoles: number;
  deleteResults: DeleteResult[];
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

    for (const permission of permissions) {
      savedPermissions.set(permission.name, permission);
    }

    const roles = await this.rolesRepository.find();

    const mappedRoles: Map<string, SeedingInterface> = new Map<
      string,
      SeedingInterface
    >();

    for (const role of roles) {
      mappedRoles.set(role.name, {
        id: role.id,
        isNew: false,
        needsUpdate: false,
        keepIt: false,
        name: role.name,
        permissions: role.permissions.map((permission) => permission.name),
      });
    }

    for (const role of ROLES) {
      const isFound = mappedRoles.has(role.name);

      if (isFound) {
        const foundRole = mappedRoles.get(role.name);

        if (!this.compareArray(role.permissions, foundRole.permissions)) {
          foundRole.needsUpdate = true;
          foundRole.permissions = role.permissions;
        }

        foundRole.keepIt = true;

        continue;
      }

      mappedRoles.set(role.name, {
        isNew: true,
        needsUpdate: false,
        keepIt: true,
        name: role.name,
        permissions: role.permissions,
      });
    }

    const rolesToDelete: SeedingInterface[] = Array.from(
      mappedRoles.values(),
    ).filter((val) => val.keepIt === false);

    const rolesToCreate: SeedingInterface[] = Array.from(
      mappedRoles.values(),
    ).filter((val) => val.isNew === true);

    const rolesToUpdate: SeedingInterface[] = Array.from(
      mappedRoles.values(),
    ).filter((val) => val.needsUpdate === true);

    const seedingReport: SeedingReport = {
      deletedRoles: 0,
      updatedRoles: 0,
      createdRoles: 0,
      skippedRoles: 0,
      deleteResults: [],
    };

    seedingReport.skippedRoles = permissions.length
      ? permissions.length - (rolesToDelete.length + rolesToUpdate.length)
      : 0;

    this.logger.log('Update Roles Repository');

    for (const role of rolesToDelete) {
      const deleteResult: DeleteResult = { id: role.id, name: role.name };

      deleteResult.affected = (
        await this.rolesRepository.delete({ id: role.id })
      )?.affected;

      seedingReport.deleteResults.push(deleteResult);
      seedingReport.deletedRoles = seedingReport.deletedRoles + 1;
    }

    for (const role of rolesToUpdate) {
      const perms = role.permissions.map((val) => savedPermissions.get(val));
      await this.rolesRepository.update(
        { id: role.id },
        { permissions: perms },
      );
      seedingReport.updatedRoles = seedingReport.updatedRoles + 1;
    }

    for (const role of rolesToCreate) {
      const perms = role.permissions.map((val) => savedPermissions.get(val));
      await this.rolesRepository.create({
        name: role.name,
        permissions: perms,
      });
      seedingReport.createdRoles = seedingReport.createdRoles + 1;
    }

    this.logger.log('Update completed');

    this.logger.log(`Roles skipped: ${seedingReport.skippedRoles}`);
    this.logger.log(`Roles created: ${seedingReport.createdRoles}`);
    this.logger.log(`Roles updated: ${seedingReport.updatedRoles}`);
    this.logger.log(`Roles deleted: ${seedingReport.deletedRoles}`);

    if (seedingReport.deletedRoles && seedingReport.deleteResults.length) {
      for (const deleteResult of seedingReport.deleteResults) {
        this.logger.log(SEPARATOR);
        this.logger.log(
          `Delete permission with id ${deleteResult.id} '${deleteResult.name}' (Affected Rows: ${deleteResult.affected ? deleteResult.affected : 0})`,
        );
      }
    }
  }

  private compareArray<T>(a: T[], b: T[]): boolean {
    for (const _a of a) {
      if (!b.includes(_a)) {
        return false;
      }
    }
    return true;
  }
}
