// GeoJSON types for venue features
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

// Venue Feature Types
export type VenueFeatureType =
  // Physical Structures
  | 'stage'              // Main stages (kineticFIELD, circuitGROUNDS)
  | 'gate'               // Entry/exit gates
  | 'vendor_booth'       // Food, merch vendors
  | 'sound_booth'        // DJ booths, sound control
  | 'medical_tent'       // First aid
  | 'security_post'      // Security checkpoints
  | 'restroom'           // Portable toilets
  | 'water_station'      // Hydration stations
  | 'art_installation'   // Art pieces
  | 'vip_area'           // VIP lounges

  // Infrastructure
  | 'pathway'            // Walkways (LineString)
  | 'road'               // Vehicle roads (LineString)
  | 'fence'              // Perimeter (LineString/Polygon)
  | 'parking_lot'        // Parking (Polygon)

  // Operational
  | 'command_center'     // Operations HQ
  | 'production_office'
  | 'warehouse'
  | 'generator'          // Power generation

  // Zones/Areas
  | 'zone'               // General area (Polygon)
  | 'boundary';          // Venue boundary (Polygon)

export type VenueFeatureCategory =
  | 'operations'
  | 'production'
  | 'security'
  | 'workforce'
  | 'vendors'
  | 'sponsors'
  | 'marketing'
  | 'finance';

export type VenueFeatureStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface VenueFeature {
  id: string;
  eventId: string;
  featureType: VenueFeatureType;
  featureCategory?: VenueFeatureCategory;
  name: string;
  code?: string;  // Short code: "GATE_A", "STAGE_1"
  geometry: GeoJSONGeometry;
  properties: Record<string, any>;  // Flexible attributes (capacity, power_requirement, etc.)
  workcenterAccess: VenueFeatureCategory[];  // Array of workcenters that can access
  status: VenueFeatureStatus;
  completionPercent: number;  // 0-100
  createdAt: Date;
  updatedAt: Date;
}

// Simplified venue bounds type
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
