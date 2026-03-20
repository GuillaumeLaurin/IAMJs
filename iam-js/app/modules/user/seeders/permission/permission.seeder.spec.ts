import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { PermissionSeeder } from '@user/seeders/permission/permission.seeder';
import { Permission } from '@user/entities/permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { stub } from 'sinon';
import type { SinonStub } from 'sinon';
import { PERMISSIONS } from '@user/consts/permission.const';
import { Action } from '@user/enums/action.enum';
import { Resource } from '@user/enums/resource.enum';
import { Scope } from '@user/enums/scope.enum';

describe('PermissionSeeder', () => {
  let seeder: PermissionSeeder;
  let permissionsRepository: {
    find: SinonStub;
    update: SinonStub;
    save: SinonStub;
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    permissionsRepository = {
      find: stub(),
      update: stub(),
      save: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionSeeder,
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionsRepository,
        },
      ],
    }).compile();

    seeder = module.get<PermissionSeeder>(PermissionSeeder);
  });

  it('should be defined', () => {
    expect(seeder).toBeDefined();
  });

  it('should save permissions if db is empty', async () => {
    permissionsRepository.find.returns([]);

    const expectedCallCount = PERMISSIONS.length;

    await seeder.onApplicationBootstrap();

    expect(permissionsRepository.save.callCount).toEqual(expectedCallCount);
  });

  it('should update permissions if description does not match db description', async () => {
    permissionsRepository.find.returns([
      {
        id: 1,
        name: `${Action.Read}:${Resource.User}:${Scope.All}`,
        description: 'Empty description',
      } as unknown as Permission,
    ]);

    await seeder.onApplicationBootstrap();

    expect(permissionsRepository.update.calledOnce).toBeTruthy();
  });
});
