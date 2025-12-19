import type { Permission, UserRole, User } from '@c2/shared';
import { ROLES } from '@c2/shared';

export class RBACService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(user: User, permission: Permission): boolean {
    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    // Check user's permissions array
    return user.permissions.some((p: Permission) => {
      // Resource and action must match
      if (p.resource !== permission.resource || p.action !== permission.action) {
        return false;
      }

      // If permission requires a specific workcenter, check if user's permission has it
      if (permission.workcenter) {
        return p.workcenter === permission.workcenter || !p.workcenter;
      }

      return true;
    });
  }

  /**
   * Check if user has access to a specific workcenter
   */
  static hasWorkcenterAccess(user: User, workcenter: string): boolean {
    if (user.role === 'admin') {
      return true;
    }

    return user.workcenters.includes(workcenter);
  }

  /**
   * Filter data based on user's workcenter access
   * @param user The user to filter for
   * @param items Array of items with workcenterAccess property
   */
  static filterByWorkcenterAccess<T extends { workcenterAccess?: string[] }>(
    user: User,
    items: T[]
  ): T[] {
    if (user.role === 'admin') {
      return items;
    }

    return items.filter((item) => {
      if (!item.workcenterAccess || item.workcenterAccess.length === 0) {
        return true; // No restrictions
      }

      // Check if user has access to at least one of the item's workcenters
      return item.workcenterAccess.some((wc) => user.workcenters.includes(wc));
    });
  }

  /**
   * Get default permissions for a role
   */
  static getDefaultPermissions(role: UserRole): Permission[] {
    const roleDefinition = ROLES[role];
    return roleDefinition ? roleDefinition.defaultPermissions : [];
  }

  /**
   * Get default workcenters for a role
   */
  static getDefaultWorkcenters(role: UserRole): string[] {
    const roleDefinition = ROLES[role];
    return roleDefinition ? roleDefinition.defaultWorkcenters : [];
  }

  /**
   * Check if user can perform action on a specific workcenter
   */
  static canAccessWorkcenterResource(
    user: User,
    resource: Permission['resource'],
    action: Permission['action'],
    workcenter: string
  ): boolean {
    // Check if user has access to the workcenter
    if (!this.hasWorkcenterAccess(user, workcenter)) {
      return false;
    }

    // Check if user has permission for this action on this resource in this workcenter
    return this.hasPermission(user, { resource, action, workcenter });
  }

  /**
   * Filter tasks by user's workcenter access
   */
  static filterTasksByWorkcenter<T extends { workcenter: string }>(
    user: User,
    tasks: T[]
  ): T[] {
    if (user.role === 'admin') {
      return tasks;
    }

    return tasks.filter((task) => user.workcenters.includes(task.workcenter));
  }

  /**
   * Check if user can create a task in a specific workcenter
   */
  static canCreateTaskInWorkcenter(user: User, workcenter: string): boolean {
    return this.canAccessWorkcenterResource(user, 'tasks', 'create', workcenter);
  }

  /**
   * Check if user can update a task
   */
  static canUpdateTask(user: User, taskWorkcenter: string): boolean {
    return this.canAccessWorkcenterResource(user, 'tasks', 'update', taskWorkcenter);
  }

  /**
   * Check if user can delete a task
   */
  static canDeleteTask(user: User, taskWorkcenter: string): boolean {
    return this.canAccessWorkcenterResource(user, 'tasks', 'delete', taskWorkcenter);
  }
}
