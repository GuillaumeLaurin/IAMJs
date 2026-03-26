import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { RoleSeeder } from '@user/seeders/role/role.seeder';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { stub, match } from 'sinon';
import type { SinonStub } from 'sinon';
import { ROLES } from '@user/consts/role.const';
import { Permission } from '@user/entities/permission.entity';
import { PERMISSIONS } from '@user/consts/permission.const';
import { Role } from '@user/entities/role.entity';
import { Role as ERole } from '@user/enums/role.enum';

function createPermissions(): Permission[] {
  const permissions: Permission[] = [];

  PERMISSIONS.forEach((val, idx) => {
    permissions.push({
      id: idx,
      name: val.name,
      description: val.description,
    });
  });

  return permissions;
}

describe('RoleSeeder', () => {
  let seeder: RoleSeeder;
  let permissionsRepository: {
    find: SinonStub;
  };
  let rolesRepository: {
    find: SinonStub;
    save: SinonStub;
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    permissionsRepository = { find: stub() };

    rolesRepository = {
      find: stub(),
      save: stub(),
    };

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

  it('should save roles if db is empty', async () => {
    rolesRepository.find.returns([]);

    const expectedCallCount = ROLES.length;

    await seeder.onApplicationBootstrap();

    expect(rolesRepository.save.callCount).toEqual(expectedCallCount);
  });

  it('should update roles if permissions do not match db permissions', async () => {
    rolesRepository.find.returns([
      {
        id: 1,
        name: `${ERole.SuperAdmin}`,
        permissions: [],
      } as unknown as Role,
    ]);

    await seeder.onApplicationBootstrap();

    // Debug
    console.log('save callCount:', rolesRepository.save.callCount);
    console.log('save called:', rolesRepository.save.called);
    console.log('save args:', rolesRepository.save.args);

    expect(rolesRepository.save.calledWith(match({ id: 1 }))).toBeTruthy();
  });
});
