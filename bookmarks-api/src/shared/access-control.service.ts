import { Injectable } from '@nestjs/common';
import { Role } from 'src/common/enums';

@Injectable()
export class AccessControlService {
  hierarchies: Array<Map<string, number>> = [];
  priority: number = 1;
  constructor() {
    this.buildRoles(Role.USER, Role.ADMIN, Role.MANAGER);
  }

  buildRoles(...roles: Role[]) {
    let hierarchy: Map<string, number>;

    roles.forEach((role) => {
      hierarchy = new Map();
      hierarchy.set(role, this.priority);

      this.hierarchies.push(hierarchy);
      this.priority++;
    });
  }

  isAuthorized(currentRole: Role, requiredRole: Role) {
    let priorityCurRole = 1;
    let priorityReqRole = 1;

    this.hierarchies.forEach((hir) => {
      if (hir.get(currentRole)) priorityCurRole = hir.get(currentRole);
      if (hir.get(requiredRole)) priorityReqRole = hir.get(requiredRole);
    });

    if (!priorityCurRole) return false;

    if (priorityCurRole >= priorityReqRole) return true;

    return false;
  }
}
