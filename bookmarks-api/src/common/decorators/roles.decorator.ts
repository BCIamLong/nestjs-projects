import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';

export const Roles = (role: Role) => SetMetadata('role', role);
