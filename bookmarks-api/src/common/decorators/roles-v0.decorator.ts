import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';

// * this roles decorator for the way we just use RBAC and don't use access control

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
