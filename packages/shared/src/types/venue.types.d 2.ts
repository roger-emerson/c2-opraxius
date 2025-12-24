export type GeoJSONGeometryType = 'Point' | 'LineString' | 'Polygon';
export interface GeoJSONGeometry {
    type: GeoJSONGeometryType;
    coordinates: number[] | number[][] | number[][][];
}
export interface GeoJSONFeature {
    type: 'Feature';
    geometry: GeoJSONGeometry;
    properties: Record<string, any>;
}
export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}
export type VenueFeatureType = 'stage' | 'gate' | 'vendor_booth' | 'sound_booth' | 'medical_tent' | 'security_post' | 'restroom' | 'water_station' | 'art_installation' | 'vip_area' | 'pathway' | 'road' | 'fence' | 'parking_lot' | 'command_center' | 'production_office' | 'warehouse' | 'generator' | 'zone' | 'boundary';
export type VenueFeatureCategory = 'operations' | 'production' | 'security' | 'workforce' | 'vendors' | 'sponsors' | 'marketing' | 'finance';
export type VenueFeatureStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export interface VenueFeature {
    id: string;
    eventId: string;
    featureType: VenueFeatureType;
    featureCategory?: VenueFeatureCategory;
    name: string;
    code?: string;
    geometry: GeoJSONGeometry;
    properties: Record<string, any>;
    workcenterAccess: VenueFeatureCategory[];
    status: VenueFeatureStatus;
    completionPercent: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface VenueBounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    center: {
        lat: number;
        lng: number;
    };
}
//# sourceMappingURL=venue.types.d.ts.map