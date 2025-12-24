import type { VenueFeatureCategory } from '../types/venue.types';
export interface WorkcenterDefinition {
    id: VenueFeatureCategory;
    name: string;
    displayName: string;
    description: string;
    icon: string;
    color: string;
}
export declare const WORKCENTERS: Record<VenueFeatureCategory, WorkcenterDefinition>;
export declare const WORKCENTER_LIST: VenueFeatureCategory[];
//# sourceMappingURL=workcenters.d.ts.map