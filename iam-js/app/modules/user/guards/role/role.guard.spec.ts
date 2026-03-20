import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { RoleGuard } from '@user/guards/role/role.guard';
import { createStubInstance } from 'sinon';
import type { SinonStubbedInstance } from 'sinon';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ROLES } from '@user/services/role/role.service.spec';

const mockExecutionContext = (user: any, handler = {}, controller = {}): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: SinonStubbedInstance<Reflector>;

  beforeEach(async () => {
    reflector = createStubInstance<Reflector>(Reflector);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    reflector.getAllAndOverride.returns(undefined);
    const ctx = mockExecutionContext(null);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return true if user has one of the required roles', () => {
    const requiredRoles = [ROLES[0].name];
    reflector.getAllAndOverride.returns(requiredRoles);

    const user = { roles: [ROLES[0]] };
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return true if user has multiple roles and at least one matches', () => {
    const requiredRoles = [ROLES[2].name];
    reflector.getAllAndOverride.returns(requiredRoles);

    const user = { roles: [ROLES[0], ROLES[2]] };
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return false if user has no matching role', () => {
    reflector.getAllAndOverride.returns([ROLES[2].name]);

    const user = { roles: [ROLES[0], ROLES[1]] };
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should return false if user has no roles', () => {
    reflector.getAllAndOverride.returns([ROLES[0].name]);

    const user = { roles: [] };
    const ctx = mockExecutionContext(user);

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should return false if user is undefined', () => {
    reflector.getAllAndOverride.returns([ROLES[0].name]);
    const ctx = mockExecutionContext(undefined);

    expect(guard.canActivate(ctx)).toBeFalsy();
  });

  it('should pass the handler and class to getAllAndOverride', () => {
    const handler = {};
    const controller = {};
    reflector.getAllAndOverride.returns(undefined);

    const ctx = mockExecutionContext(null, handler, controller);
    guard.canActivate(ctx);

    expect(reflector.getAllAndOverride.calledOnceWith('roles', [handler, controller])).toBeTruthy();
  });
});
