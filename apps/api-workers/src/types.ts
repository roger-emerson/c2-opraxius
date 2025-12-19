import type { Context } from 'hono';
import type { Env } from './lib/db';
import type { Database } from './lib/db';
import type { CacheService } from './lib/redis';

// User types (matching @c2/shared)
export type UserRole =
  | 'admin'
  | 'operations_lead'
  | 'production_lead'
  | 'security_lead'
  | 'workforce_lead'
  | 'vendor_lead'
  | 'sponsor_lead'
  | 'marketing_lead'
  | 'finance_lead'
  | 'viewer';

export type ResourceType = 'tasks' | 'venue_features' | 'events' | 'users' | 'integrations';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface Permission {
  resource: ResourceType;
  action: PermissionAction;
  workcenter?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  workcenters: string[];
  permissions: Permission[];
  auth0UserId?: string;
  lastLoginAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended environment bindings for Hono context
export interface AppBindings {
  Bindings: Env;
  Variables: {
    user: User;
    db: Database;
    cache: CacheService;
  };
}

// Context type for authenticated routes
export type AppContext = Context<AppBindings>;

