import type { VenueFeatureStatus, VenueFeatureType } from '@c2/shared';

/**
 * Get color based on venue feature status
 */
export function getStatusColor(status: VenueFeatureStatus): string {
  const colors: Record<VenueFeatureStatus, string> = {
    pending: '#6b7280',      // gray
    in_progress: '#eab308',  // yellow
    completed: '#22c55e',    // green
    blocked: '#ef4444',      // red
  };
  return colors[status] || '#6b7280';
}

/**
 * Get accent color based on feature type
 */
export function getFeatureColor(featureType: VenueFeatureType): string {
  const colors: Record<string, string> = {
    // Stages - vibrant EDC colors
    stage: '#ff00ff',           // magenta
    sound_booth: '#00ffff',     // cyan
    vip_area: '#8b5cf6',        // purple

    // Facilities - functional colors
    vendor_booth: '#f59e0b',    // amber
    medical_tent: '#ef4444',    // red
    security_post: '#3b82f6',   // blue
    restroom: '#9ca3af',        // gray
    water_station: '#0ea5e9',   // sky blue
    gate: '#f97316',            // orange

    // Landmarks
    art_installation: '#10b981', // emerald
    
    // Infrastructure
    pathway: '#a8a29e',         // stone
    road: '#78716c',            // stone darker
    fence: '#d6d3d1',           // stone lighter
    parking_lot: '#44403c',     // stone darkest

    // Operational
    command_center: '#dc2626',  // red
    production_office: '#7c3aed', // violet
    warehouse: '#737373',       // neutral
    generator: '#facc15',       // yellow

    // Zones
    zone: '#6366f1',            // indigo
    boundary: '#a855f7',        // purple
  };
  return colors[featureType] || '#6b7280';
}

/**
 * Get category for model selection
 */
export type ModelCategory = 'stage' | 'facility' | 'landmark' | 'infrastructure';

export function getModelCategory(featureType: VenueFeatureType): ModelCategory {
  const stageTypes: VenueFeatureType[] = ['stage', 'sound_booth', 'vip_area'];
  const facilityTypes: VenueFeatureType[] = [
    'vendor_booth', 'medical_tent', 'security_post', 
    'restroom', 'water_station', 'gate',
    'command_center', 'production_office', 'warehouse', 'generator'
  ];
  const landmarkTypes: VenueFeatureType[] = ['art_installation'];

  if (stageTypes.includes(featureType)) return 'stage';
  if (facilityTypes.includes(featureType)) return 'facility';
  if (landmarkTypes.includes(featureType)) return 'landmark';
  return 'infrastructure'; // pathways, roads, fences, parking_lot, zone, boundary
}

/**
 * Get height for different feature types
 */
export function getFeatureHeight(featureType: VenueFeatureType): number {
  const heights: Record<string, number> = {
    stage: 30,
    sound_booth: 20,
    gate: 25,
    vendor_booth: 15,
    medical_tent: 12,
    security_post: 15,
    restroom: 10,
    water_station: 12,
    art_installation: 20,
    vip_area: 15,
    command_center: 25,
    production_office: 18,
    warehouse: 20,
    generator: 10,
    pathway: 2,
    road: 2,
    fence: 8,
    parking_lot: 1,
    zone: 5,
    boundary: 3,
  };
  return heights[featureType] || 10;
}

/**
 * Get base size for different feature types
 */
export function getFeatureSize(featureType: VenueFeatureType): number {
  const sizes: Record<string, number> = {
    stage: 40,
    sound_booth: 20,
    gate: 15,
    vendor_booth: 10,
    medical_tent: 15,
    security_post: 10,
    restroom: 8,
    water_station: 10,
    art_installation: 25,
    vip_area: 30,
    command_center: 35,
    production_office: 25,
    warehouse: 40,
    generator: 12,
    pathway: 5,
    road: 10,
    fence: 2,
    parking_lot: 50,
    zone: 20,
    boundary: 5,
  };
  return sizes[featureType] || 15;
}

