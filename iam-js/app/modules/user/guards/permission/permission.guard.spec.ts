import { Test, TestingModule } from '@nestjs/testing';
import { PermissionGuard } from './permission.guard';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ROLES, PERMISSIONS } from '@user/services/role/role.service.spec';

const mockExecutionContext = (user: any, handler = {}, controller = {}): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: SinonStubbedInstance<Reflector>;

  beforeEach(async () => {
    reflector = createStubInstance<Reflector>(Reflector);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no permissions are required', () => {
    reflector.getAllAndOverride.returns(undefined);
    const ctx = mockExecutionContext(null);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return true if user has all required permissions', () => {
    reflector.getAllAndOverride.returns([PERMISSIONS[0].name]);

    const user = { roles: [ROLES[1]] }; // ROLES[1] has PERMISSIONS[0]
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return true if user has all required permissions spread across multiple roles', () => {
    reflector.getAllAndOverride.returns([PERMISSIONS[0].name, PERMISSIONS[1].name]);

    const user = { roles: [ROLES[0], ROLES[1]] }; // ROLES[0] has PERMISSIONS[1,2], ROLES[1] has PERMISSIONS[0]
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return false if user is missing at least one required permission', () => {
    reflector.getAllAndOverride.returns([PERMISSIONS[0].name, PERMISSIONS[2].name]);

    const user = { roles: [ROLES[1]] }; // ROLES[1] only has PERMISSIONS[0]
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should return false if user has no permissions at all', () => {
    reflector.getAllAndOverride.returns([PERMISSIONS[0].name]);

    const user = { roles: [{ id: 99, name: 'empty-role', permissions: [] }] };
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should return false if user has no roles', () => {
    reflector.getAllAndOverride.returns([PERMISSIONS[0].name]);

    const user = { roles: [] };
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should return false if user is undefined', () => {
    reflector.getAllAndOverride.returns([PERMISSIONS[0].name]);
    const ctx = mockExecutionContext(undefined);

    expect(guard.canActivate(ctx)).toBeFalsy();
  });

  it('should pass the handler and class to getAllAndOverride', () => {
    const handler = {};
    const controller = {};
    reflector.getAllAndOverride.returns(undefined);

    const ctx = mockExecutionContext(null, handler, controller);
    guard.canActivate(ctx);

    expect(
      reflector.getAllAndOverride.calledOnceWith('permissions', [handler, controller]),
    ).toBeTruthy();
  });
});
