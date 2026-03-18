import { Test, TestingModule } from '@nestjs/testing';
import { RoleSeeder } from './role.seeder';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { SinonStub, stub } from 'sinon';
import { ROLES } from '@user/consts/role.const';
import { Permission } from '@user/entities/permission.entity';
import { PERMISSIONS } from '@user/consts/permission.const';
import { Role } from '@user/entities/role.entity';
import { Role as ERole } from '@user/enums/role.enum';

function createPermissions(): Permission[] {
      const permissions: Permission[] = [];

      let idx = 0;
      for (const permission of PERMISSIONS) {
          permissions.push({
              id: idx,
              name: permission.name,
              description: permission.description
          } as unknown as Permission);

          idx = idx + 1;
      }

      return permissions;
}

describe('RoleSeeder', () => {
    let seeder: RoleSeeder;
    let permissionsRepository: {
        find: SinonStub,
    };
    let rolesRepository: {
        find: SinonStub,
        delete: SinonStub,
        update: SinonStub,
        create: SinonStub
    };

    beforeEach(async () => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

        permissionsRepository = { find: stub() };

        rolesRepository = { find: stub(), delete: stub(), update: stub(), create: stub() };
        
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleSeeder,
                {
                    provide: getRepositoryToken(Permission),
                    useValue: permissionsRepository,
                },
                {
                    provide: getRepositoryToken(Role),
                    useValue: rolesRepository,
                },
            ],
        }).compile();

        seeder = module.get<RoleSeeder>(RoleSeeder);

        permissionsRepository.find.returns([...createPermissions()]);
    });

    it('should be defined', () => {
        expect(seeder).toBeDefined();
    });

    it('should create roles if db is empty', async () => {
        
        rolesRepository.find.returns([]);

        const expectedCallCount = ROLES.length;

        await seeder.onApplicationBootstrap();

        expect(rolesRepository.create.callCount).toEqual(expectedCallCount);
    });

    it('should update roles if permissions do not match db permissions', async () => {
        rolesRepository.find.returns([{ id: 1, name: `${ERole.SuperAdmin}`, permissions: [] } as unknown as Role]);

        await seeder.onApplicationBootstrap();

        expect(rolesRepository.update.calledOnce).toBeTruthy();
    });

    it('should remove role if it os not found in the list', async () => {
        rolesRepository.find.returns([{ id: 1, name: `super-agent`, permissions: [] } as unknown as Role]);

        await seeder.onApplicationBootstrap();

        expect(rolesRepository.delete.calledOnce).toBeTruthy();
    });
});