import { createMiddleware } from 'hono/factory';
import * as jose from 'jose';
import type { AppBindings, User } from '../types';

const DEFAULT_JWT_SECRET = 'dev-secret-change-in-production';

/**
 * JWT Authentication middleware for Cloudflare Workers
 * Uses jose library (Workers-compatible) instead of jsonwebtoken
 */
export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'No authorization header' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET || DEFAULT_JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Build user object from JWT payload
    const user: User = {
      id: (payload.id as string) || (payload.userId as string) || '',
      email: payload.email as string || '',
      name: payload.name as string || '',
      role: (payload.role as User['role']) || 'viewer',
      workcenters: (payload.workcenters as string[]) || [],
      permissions: (payload.permissions as User['permissions']) || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!user.isActive) {
      return c.json({ error: 'User account is inactive' }, 403);
    }

    // Attach user to context
    c.set('user', user);

    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

