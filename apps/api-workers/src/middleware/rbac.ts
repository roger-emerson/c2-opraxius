import { createMiddleware } from 'hono/factory';
import type { AppBindings, Permission, User } from '../types';

/**
 * RBAC Service for permission and workcenter access checks
 */
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
   */
  static filterByWorkcenterAccess<T extends { workcenterAccess?: string[] | null }>(
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
   * Filter tasks by user's workcenter access
   */
  static filterTasksByWorkcenter<T extends { workcenter: string | null }>(
    user: User,
    tasks: T[]
  ): T[] {
    if (user.role === 'admin') {
      return tasks;
    }

    return tasks.filter((task) => task.workcenter && user.workcenters.includes(task.workcenter));
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
    if (!this.hasWorkcenterAccess(user, workcenter)) {
      return false;
    }

    return this.hasPermission(user, { resource, action, workcenter });
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

/**
 * Middleware factory to require a specific permission
 */
export function requirePermission(permission: Permission) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const hasPermission = RBACService.hasPermission(user, permission);

    if (!hasPermission) {
      return c.json({
        error: 'Forbidden',
        message: `You do not have permission to ${permission.action} ${permission.resource}${
          permission.workcenter ? ` in ${permission.workcenter}` : ''
        }`,
      }, 403);
    }

    await next();
  });
}

/**
 * Middleware factory to require workcenter access
 */
export function requireWorkcenterAccess(workcenter: string) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const hasAccess = RBACService.hasWorkcenterAccess(user, workcenter);

    if (!hasAccess) {
      return c.json({
        error: 'Forbidden',
        message: `You do not have access to ${workcenter} workcenter`,
      }, 403);
    }

    await next();
  });
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = createMiddleware<AppBindings>(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({
      error: 'Forbidden',
      message: 'This action requires admin privileges',
    }, 403);
  }

  await next();
});

