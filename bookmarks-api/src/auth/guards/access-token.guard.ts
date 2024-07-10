import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('access-token-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublicRoute = this.reflector.getAllAndOverride('isPublicRoute', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isPublicRoute) return super.canActivate(context);

    return true; // * this will deactivate the guard and skip itself
  }
}
