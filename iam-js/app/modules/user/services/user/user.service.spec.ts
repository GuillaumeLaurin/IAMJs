import { TestingModule, Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { ROLES } from '@user/services/role/role.service.spec';
import {
  SinonStubbedInstance,
  createStubInstance,
  SinonStub,
  stub,
} from 'sinon';
import { RoleService } from '@user/services/role/role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@user/entities/role.entity';

const USER_ID = '1';
const USER_EMAIL = 'john.doe@example.com';
const USER_PASSWORD = 'password123';

const USERS = [
  {
    id: USER_ID,
    firstName: 'John',
    lastName: 'Doe',
    email: USER_EMAIL,
    age: 30,
    gender: 'male',
    password: 'hashed_password',
    roles: [...ROLES.slice(0, 2)],
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    age: 28,
    gender: 'female',
    password: 'hashed_password',
    roles: [ROLES.at(0)],
  },
] as unknown as User[];

describe('UserService', () => {
  let service: UserService;
  let roleService: SinonStubbedInstance<RoleService>;
  let userRepository: {
    create: SinonStub;
    save: SinonStub;
    find: SinonStub;
    findOne: SinonStub;
    remove: SinonStub;
  };

  beforeEach(async () => {
    roleService = createStubInstance<RoleService>(RoleService);
    userRepository = {
      create: stub(),
      save: stub(),
      find: stub(),
      findOne: stub(),
      remove: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: RoleService,
          useValue: roleService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      firstName: 'john',
      lastName: 'doe',
      email: '  John.Doe@Example.com  ',
      age: 30,
      gender: 'male',
      password: USER_PASSWORD,
    };

    it('should create and return a new user', async () => {
      userRepository.findOne.returns(null);
      roleService.findMany.resolves([...ROLES]);
      userRepository.create.returns(USERS[0]);
      userRepository.save.resolves(USERS[0]);

      const result = await service.create({ ...dto });

      expect(userRepository.save.calledOnce).toBeTruthy();
      expect(result).toEqual(USERS[0]);
    });

    it('should trim and lowercase the email before processing', async () => {
      userRepository.findOne.returns(null);
      roleService.findMany.resolves([...ROLES]);
      userRepository.create.returns(USERS[0]);
      userRepository.save.resolves(USERS[0]);

      await service.create({ ...dto });

      const createdWith = userRepository.create.getCall(0).args[0];
      expect(createdWith.email).toEqual('john.doe@example.com');
    });

    it('should capitalize the first letter of firstName and lastName', async () => {
      userRepository.findOne.returns(null);
      roleService.findMany.resolves([...ROLES]);
      userRepository.create.returns(USERS[0]);
      userRepository.save.resolves(USERS[0]);

      await service.create({ ...dto });

      const createdWith = userRepository.create.getCall(0).args[0];
      expect(createdWith.firstName).toEqual('John');
      expect(createdWith.lastName).toEqual('Doe');
    });

    it('should throw ConflictException if email is already taken', async () => {
      userRepository.findOne.returns(USERS[0]);

      await expect(service.create({ ...dto })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if no default roles are found', async () => {
      userRepository.findOne.returns(null);
      roleService.findMany.resolves([]);

      await expect(service.create({ ...dto })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with their roles and permissions', async () => {
      userRepository.find.resolves(USERS);

      const result = await service.findAll();

      expect(
        userRepository.find.calledOnceWith({
          relations: ['roles', 'roles.permissions'],
        }),
      ).toBeTruthy();
      expect(result.length).toEqual(USERS.length);
    });
  });

  describe('findOne', () => {
    it('should return the user matching the given id', async () => {
      userRepository.findOne.resolves(USERS[0]);

      const result = await service.findOne(USER_ID);

      expect(
        userRepository.findOne.calledOnceWith({
          where: { id: USER_ID },
          relations: ['roles', 'roles.permissions'],
        }),
      ).toBeTruthy();
      expect(result).toEqual(USERS[0]);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.resolves(null);

      await expect(service.findOne(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return the user matching the given email', async () => {
      userRepository.findOne.resolves(USERS[0]);

      const result = await service.findByEmail(USER_EMAIL);

      expect(
        userRepository.findOne.calledOnceWith({
          where: { email: USER_EMAIL },
          relations: ['roles', 'roles.permissions'],
        }),
      ).toBeTruthy();
      expect(result).toEqual(USERS[0]);
    });

    it('should return null if no user matches the given email', async () => {
      userRepository.findOne.resolves(null);

      const result = await service.findByEmail(USER_EMAIL);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updated = { ...USERS[0], firstName: 'Jack' };
      userRepository.findOne.resolves(USERS[0]);
      userRepository.save.resolves(updated);

      const result = await service.update(USER_ID, { firstName: 'jack' });

      expect(userRepository.save.calledOnce).toBeTruthy();
      expect(result.firstName).toEqual('Jack');
    });

    it('should hash the password if provided in dto', async () => {
      userRepository.findOne.resolves(USERS[0]);
      userRepository.save.resolves(USERS[0]);

      await service.update(USER_ID, { password: 'newpassword' });

      const savedWith = userRepository.save.getCall(0).args[0];
      expect(savedWith.password).not.toEqual('newpassword');
    });

    it('should throw ConflictException if the new email is already taken', async () => {
      userRepository.findOne
        .onFirstCall()
        .resolves(USERS[0]) // findOne (by id)
        .onSecondCall()
        .resolves(USERS[1]); // findByEmail

      await expect(
        service.update(USER_ID, { email: 'jane.doe@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.resolves(null);

      await expect(
        service.update(USER_ID, { firstName: 'Jack' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the user matching the given id', async () => {
      userRepository.findOne.resolves(USERS[0]);
      userRepository.remove.resolves();

      await service.remove(USER_ID);

      expect(userRepository.remove.calledOnceWith(USERS[0])).toBeTruthy();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.resolves(null);

      await expect(service.remove(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignRole', () => {
    it('should assign a new role to the user and save', async () => {
      const user = { ...USERS[0], roles: [ROLES[0]] } as unknown as User;
      const newRole = ROLES[2] as unknown as Role;
      userRepository.findOne.resolves(user);
      userRepository.save.resolves({
        ...user,
        roles: [...user.roles, newRole],
      });

      const result = await service.assignRole(USER_ID, newRole);

      expect(userRepository.save.calledOnce).toBeTruthy();
      expect(result.roles).toContain(newRole);
    });

    it('should not save if user already has the role', async () => {
      const existingRole = ROLES[0] as unknown as Role;
      const user = { ...USERS[0], roles: [existingRole] } as unknown as User;
      userRepository.findOne.resolves(user);

      const result = await service.assignRole(USER_ID, existingRole);

      expect(userRepository.save.called).toBeFalsy();
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.resolves(null);

      await expect(
        service.assignRole(USER_ID, ROLES[0] as unknown as Role),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
