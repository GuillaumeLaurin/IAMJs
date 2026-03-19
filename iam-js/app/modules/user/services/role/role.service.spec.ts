import { TestingModule, Test } from '@nestjs/testing';
import { RoleService } from './role.service';
import { Role } from '@user/entities/role.entity';
import { SinonStub, stub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from '@user/entities/permission.entity';

export const PERMISSIONS = [
  {
    id: 1,
    name: 'perm-1',
    description: '...',
  },
  {
    id: 2,
    name: 'perm-2',
    description: '...',
  },
  {
    id: 3,
    name: 'perm-3',
    description: '...',
  },
] as unknown as Permission[];

const ROLE_1 = 'role-1';

export const ROLES = [
  {
    id: 1,
    name: ROLE_1,
    permissions: [...PERMISSIONS.slice(1, 2)],
  },
  {
    id: 2,
    name: 'role-2',
    permissions: [PERMISSIONS.at(0)],
  },
  {
    id: 3,
    name: 'role-3',
    permissions: [...PERMISSIONS],
  },
] as unknown as Role[];

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: {
    find: SinonStub;
    findOne: SinonStub;
  };

  beforeEach(async () => {
    roleRepository = { find: stub(), findOne: stub() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should returned every roles found in db', async () => {
    roleRepository.find.returns(ROLES);
    const result = await service.findAll();
    expect(roleRepository.find.calledOnce).toBeTruthy();
    expect(result.length).toEqual(ROLES.length);
  });

  it('should returned the role that has the same name', async () => {
    roleRepository.findOne.returns(ROLES[0]);
    const result = await service.findOne(ROLE_1);
    expect(roleRepository.findOne.calledOnce).toBeTruthy();
    expect(result).toEqual(ROLES[0]);
  });

  it('should returned null if not found', async () => {
    roleRepository.findOne.returns(null);
    const result = await service.findOne(ROLE_1);
    expect(roleRepository.findOne.calledOnce).toBeTruthy();
    expect(result).toBeNull();
  });

  it('should returned a list of roles that match given names', async () => {
    roleRepository.find.returns(ROLES);
    const result = await service.findMany(['role-1', 'role-2', 'role-3']);
    expect(roleRepository.find.calledOnce).toBeTruthy();
    expect(result.length).toEqual(ROLES.length);
  });
});
