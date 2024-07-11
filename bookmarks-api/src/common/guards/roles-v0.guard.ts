import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums';

// * This role is implemented by RBAC and don't use AC (access control)
// * we use @UseGuards(Role.ADMIN, Role.USER) and only the user has role either admin or user can access

// ? but the problem when the our project grow we have maybe over 10 roles then that means we need to write @UseGuards(Role.ADMIN, Role.USER,...) and 10 roles if the route maybe for everyone
// * so it doesn't good right

// * so therefore we should use the access control way or combine both of them RBAC and AC to create more efficient solution

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublicRoute = this.reflector.getAllAndOverride('isPublicRoute', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) return true;

    const request = context.switchToHttp().getRequest();

    const rolesMetadata = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    return rolesMetadata.some((role: Role) => request.user.role === role);
  }
}
