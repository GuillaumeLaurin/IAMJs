import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@user/entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) return true;

    const { user }: { user: User } = context.switchToHttp().getRequest();

    const userPermissions = user?.roles?.flatMap((role) => role.permissions.map((p) => p.name));

    return requiredPermissions.every((p) => userPermissions?.includes(p));
  }
}
