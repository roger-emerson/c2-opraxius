import type { VenueFeatureCategory } from './venue.types';

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
  workcenter?: VenueFeatureCategory;  // Optional scope to specific workcenter
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  workcenters: VenueFeatureCategory[];  // Array of accessible workcenters
  permissions: Permission[];  // Granular permissions
  auth0UserId?: string;  // SSO user ID
  lastLoginAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession extends User {
  accessToken: string;
  refreshToken?: string;
}
