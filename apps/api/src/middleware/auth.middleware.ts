import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import type { User } from '@esg/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: User;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateJWT(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      reply.status(401).send({ error: 'No authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      reply.status(401).send({ error: 'No token provided' });
      return;
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // TODO: Fetch full user from database using decoded.userId or decoded.email
    // For now, use mock user data from token
    request.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'viewer',
      workcenters: decoded.workcenters || [],
      permissions: decoded.permissions || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  } catch (error) {
    reply.status(401).send({ error: 'Invalid token' });
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticateJWT(request, reply);

  if (!request.user) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  if (!request.user.isActive) {
    reply.status(403).send({ error: 'User account is inactive' });
    return;
  }
}
