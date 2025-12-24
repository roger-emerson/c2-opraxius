import type { Permission, UserRole } from '../types/user.types';
import type { VenueFeatureCategory } from '../types/venue.types';
export interface RoleDefinition {
    role: UserRole;
    displayName: string;
    description: string;
    defaultWorkcenters: VenueFeatureCategory[];
    defaultPermissions: Permission[];
}
export declare const ROLES: Record<UserRole, RoleDefinition>;
//# sourceMappingURL=roles.d.ts.map