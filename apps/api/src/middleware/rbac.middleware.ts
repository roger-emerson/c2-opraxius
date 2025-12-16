import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Permission } from '@esg/shared';
import { RBACService } from '../services/rbac.service.js';
import type { AuthenticatedRequest } from './auth.middleware.js';

/**
 * Create middleware to check if user has required permission
 */
export function requirePermission(permission: Permission) {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const hasPermission = RBACService.hasPermission(request.user, permission);

    if (!hasPermission) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `You do not have permission to ${permission.action} ${permission.resource}${
          permission.workcenter ? ` in ${permission.workcenter}` : ''
        }`,
      });
      return;
    }
  };
}

/**
 * Create middleware to check if user has access to a workcenter
 */
export function requireWorkcenterAccess(workcenter: string) {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const hasAccess = RBACService.hasWorkcenterAccess(request.user, workcenter);

    if (!hasAccess) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `You do not have access to ${workcenter} workcenter`,
      });
      return;
    }
  };
}

/**
 * Create middleware to check if user has specific role(s)
 */
export function requireRole(...roles: string[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(request.user.role)) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
      return;
    }
  };
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  if (request.user.role !== 'admin') {
    reply.status(403).send({
      error: 'Forbidden',
      message: 'This action requires admin privileges',
    });
    return;
  }
}
