import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '@user/entities/permission.entity';
import { PERMISSIONS } from '@user/consts/permission.const';

interface SeedingInterface {
  id?: number;
  isNew: boolean;
  needsUpdate: boolean;
  name: string;
  description: string;
}

interface SeedingReport {
  updatedPermissions: number;
  createdPermissions: number;
  skippedPermissions: number;
}

@Injectable()
export class PermissionSeeder implements OnApplicationBootstrap {
  private logger: Logger = new Logger(PermissionSeeder.name);

  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const mappedPermissions = new Map<string, SeedingInterface>();

    const permissions = await this.permissionsRepository.find();

    permissions.forEach((permission) => {
      mappedPermissions.set(permission.name, {
        id: permission.id,
        isNew: false,
        needsUpdate: false,
        name: permission.name,
        description: permission.description,
      });
    });

    PERMISSIONS.forEach((permission) => {
      const foundPermission = mappedPermissions.get(permission.name);

      if (foundPermission) {
        if (permission.description !== foundPermission.description) {
          foundPermission.needsUpdate = true;
          foundPermission.description = permission.description;
        }
      } else {
        mappedPermissions.set(permission.name, {
          isNew: true,
          needsUpdate: false,
          name: permission.name,
          description: permission.description,
        });
      }
    });

    const permissionsToCreate = Array.from(mappedPermissions.values()).filter(
      (val) => val.isNew === true,
    );

    const permissionsToUpdate = Array.from(mappedPermissions.values()).filter(
      (val) => val.needsUpdate === true,
    );

    const seedingReport: SeedingReport = {
      updatedPermissions: 0,
      createdPermissions: 0,
      skippedPermissions: 0,
    };

    seedingReport.skippedPermissions = permissions.length
      ? permissions.length - permissionsToUpdate.length
      : 0;

    this.logger.log('Update Permission Repository');

    await Promise.all(
      permissionsToUpdate.map(async (permission) => {
        await this.permissionsRepository.update(
          { id: permission.id },
          { description: permission.description },
        );
        seedingReport.updatedPermissions += 1;
      }),
    );

    await Promise.all(
      permissionsToCreate.map(async (permission) => {
        await this.permissionsRepository.save({
          name: permission.name,
          description: permission.description,
        });
        seedingReport.createdPermissions += 1;
      }),
    );

    this.logger.log('Update completed');

    this.logger.log(`Permissions skipped: ${seedingReport.skippedPermissions}`);
    this.logger.log(`Permissions created: ${seedingReport.createdPermissions}`);
    this.logger.log(`Permissions updated: ${seedingReport.updatedPermissions}`);
  }
}
