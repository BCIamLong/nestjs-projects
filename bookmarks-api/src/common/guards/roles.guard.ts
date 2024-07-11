import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { Role } from '../enums';
import { AccessControlService } from 'src/shared/access-control.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublicRoute = this.reflector.getAllAndOverride('isPublicRoute', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) return true;

    const roleMetadata = this.reflector.getAllAndOverride('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roleMetadata) return false;

    const request = context.switchToHttp().getRequest();

    // console.log(this.accessControlService.hierarchies);

    return this.accessControlService.isAuthorized(
      request.user.role,
      roleMetadata,
    );

    // return rolesMetadata.some((role: Role) => request.user.role === role);
  }
}
