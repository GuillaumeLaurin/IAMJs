import { Injectable } from '@nestjs/common';
import { OnApplicationBootstrap, Logger } from '@nestjs/common';
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
    const mappedPermissions: Map<string, SeedingInterface> = new Map<
      string,
      SeedingInterface
    >();

    const permissions = await this.permissionsRepository.find();

    for (const permission of permissions) {
      mappedPermissions.set(permission.name, {
        id: permission.id,
        isNew: false,
        needsUpdate: false,
        name: permission.name,
        description: permission.description,
      });
    }

    for (const permission of PERMISSIONS) {
      const isFound = mappedPermissions.has(permission.name);

      if (isFound) {
        const foundPermission = mappedPermissions.get(permission.name);

        if (permission.description !== foundPermission.description) {
          foundPermission.needsUpdate = true;
          foundPermission.description = permission.description;
        }

        continue;
      }

      mappedPermissions.set(permission.name, {
        isNew: true,
        needsUpdate: false,
        name: permission.name,
        description: permission.description,
      });
    }

    const permissionsToCreate: SeedingInterface[] = Array.from(
      mappedPermissions.values(),
    ).filter((val) => val.isNew === true);

    const permissionsToUpdate: SeedingInterface[] = Array.from(
      mappedPermissions.values(),
    ).filter((val) => val.needsUpdate === true);

    const seedingReport: SeedingReport = {
      updatedPermissions: 0,
      createdPermissions: 0,
      skippedPermissions: 0,
    };

    seedingReport.skippedPermissions = permissions.length
      ? permissions.length - permissionsToUpdate.length
      : 0;

    this.logger.log('Update Permission Repository');

    for (const permission of permissionsToUpdate) {
      await this.permissionsRepository.update(
        { id: permission.id },
        { description: permission.description },
      );
      seedingReport.updatedPermissions = seedingReport.updatedPermissions + 1;
    }

    for (const permission of permissionsToCreate) {
      await this.permissionsRepository.create({
        name: permission.name,
        description: permission.description,
      });
      seedingReport.createdPermissions = seedingReport.createdPermissions + 1;
    }

    this.logger.log('Update completed');

    this.logger.log(`Permissions skipped: ${seedingReport.skippedPermissions}`);
    this.logger.log(`Permissions created: ${seedingReport.createdPermissions}`);
    this.logger.log(`Permissions updated: ${seedingReport.updatedPermissions}`);
  }
}
