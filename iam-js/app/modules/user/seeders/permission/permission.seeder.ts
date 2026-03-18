import { Injectable } from "@nestjs/common";
import { OnApplicationBootstrap, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "@user/entities/permission.entity";
import { PERMISSIONS } from "@user/consts/permission.const";

const SEPARATOR = `===================================================`;

interface SeedingInterface {
    id?: number;
    isNew: boolean;
    needsUpdate: boolean;
    keepIt: boolean;
    name: string;
    description: string;
}

interface DeleteResult {
    id: number;
    name: string;
    affected?: number | null;
}

interface SeedingReport {
    deletedPermissions: number;
    updatedPermissions: number;
    createdPermissions: number;
    skippedPermissions: number;
    deleteResults: DeleteResult[];
}

@Injectable()
export class PermissionSeeder implements OnApplicationBootstrap {
    private logger: Logger = new Logger(PermissionSeeder.name);

    constructor(
      @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const mappedPermissions: Map<string, SeedingInterface> = new Map<string, SeedingInterface>();
        
        const permissions = await this.permissionsRepository.find();

        for (const permission of permissions)
        {
            mappedPermissions.set(permission.name, {
              id: permission.id,
              isNew: false, 
              needsUpdate: false, 
              keepIt: false, 
              name: permission.name,
              description: permission.description,
            });
        }

        for (const permission of PERMISSIONS)
        { 
            const isFound = mappedPermissions.has(permission.name);

            if (isFound)
            {
                const foundPermission = mappedPermissions.get(permission.name);
                
                // if there is a difference in the description, update the permission
                if (permission.description !== foundPermission.description)
                {
                    foundPermission.needsUpdate = true;
                    foundPermission.description = permission.description;
                }

                // keep the permission
                foundPermission.keepIt = true;

                continue;
            }

            // if not found, create the permission
            mappedPermissions.set(permission.name, {
                isNew: true,
                needsUpdate: false,
                keepIt: true,
                name: permission.name,
                description: permission.description,
            });
        }

        const permissionsToDelete: SeedingInterface[] = Array.from(mappedPermissions.values()).filter((val) => val.keepIt === false);

        const permissionsToCreate: SeedingInterface[] = Array.from(mappedPermissions.values()).filter((val) => val.isNew === true);

        const permissionsToUpdate: SeedingInterface[] = Array.from(mappedPermissions.values()).filter((val) => val.needsUpdate === true);

        const seedingReport: SeedingReport = { deletedPermissions: 0, updatedPermissions: 0, createdPermissions: 0, skippedPermissions: 0, deleteResults: [] };

        seedingReport.skippedPermissions = permissions.length ? permissions.length - (permissionsToDelete.length + permissionsToUpdate.length) : 0;

        this.logger.log("Update Permission Repository");
        
        for (const permission of permissionsToDelete) {
            const deleteResult: DeleteResult = { id: permission.id, name: permission.name };
            // id should be defined
            deleteResult.affected = (await this.permissionsRepository.delete({ id: permission.id }))?.affected;

            seedingReport.deleteResults.push(deleteResult);
            seedingReport.deletedPermissions = seedingReport.deletedPermissions + 1;
        }

        for (const permission of permissionsToUpdate) {
            await this.permissionsRepository.update({ id: permission.id }, { description: permission.description });
            seedingReport.updatedPermissions = seedingReport.updatedPermissions + 1;
        } 

        for (const permission of permissionsToCreate) {
            await this.permissionsRepository.create({ name: permission.name, description: permission.description });
            seedingReport.createdPermissions = seedingReport.createdPermissions + 1;
        }

        this.logger.log("Update completed");

        this.logger.log(`Permissions created: ${seedingReport.createdPermissions}`);
        this.logger.log(`Permissions updated: ${seedingReport.updatedPermissions}`);
        this.logger.log(`Permissions deleted: ${seedingReport.deletedPermissions}`);

        if (seedingReport.deletedPermissions && seedingReport.deleteResults.length) {
            for (const deleteResult of seedingReport.deleteResults) {
                this.logger.log(SEPARATOR);
                this.logger.log(`Delete permission with id ${deleteResult.id} '${deleteResult.name}' (Affected Rows: ${deleteResult.affected ? deleteResult.affected : 0})`);
            }
        }
    }
}