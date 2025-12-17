import type { Feature, FeatureCollection, Geometry, Point, LineString, Polygon } from 'geojson';
import type { VenueFeature, VenueFeatureType } from '@esg/shared';

/**
 * Parse a GeoJSON FeatureCollection and convert to venue features
 *
 * @param geojson GeoJSON FeatureCollection
 * @param eventId Event ID to associate features with
 * @param defaultType Default feature type if not specified
 * @param defaultWorkcenter Default workcenter access if not specified
 * @returns Array of venue features ready for database import
 */
export function parseGeoJSON(
  geojson: FeatureCollection,
  eventId: string,
  defaultType: VenueFeatureType = 'zone',
  defaultWorkcenter: string[] = ['operations']
): Omit<VenueFeature, 'id' | 'createdAt' | 'updatedAt'>[] {
  if (geojson.type !== 'FeatureCollection') {
    throw new Error('Invalid GeoJSON: must be a FeatureCollection');
  }

  return geojson.features.map((feature) => parseFeature(feature, eventId, defaultType, defaultWorkcenter));
}

/**
 * Parse a single GeoJSON Feature
 */
export function parseFeature(
  feature: Feature,
  eventId: string,
  defaultType: VenueFeatureType = 'zone',
  defaultWorkcenter: string[] = ['operations']
): Omit<VenueFeature, 'id' | 'createdAt' | 'updatedAt'> {
  const props = feature.properties || {};

  // Determine feature type from properties or use default
  const featureType = inferFeatureType(props, defaultType);

  // Extract name from various common property names
  const name = props.NAME || props.name || props.title || props.label || 'Unnamed Feature';

  // Extract code/identifier
  const code = props.CODE || props.code || props.ALIAS1 || props.alias || undefined;

  // Determine feature category (workcenter)
  const featureCategory = inferFeatureCategory(featureType, props);

  // Determine workcenter access
  const workcenterAccess = props.workcenterAccess || props.workcenters || defaultWorkcenter;

  // Convert geometry to PostGIS-compatible format
  const geometry = convertGeometry(feature.geometry);

  // Extract additional properties
  const additionalProps = {
    ...props,
    // Remove redundant fields
    NAME: undefined,
    name: undefined,
    CODE: undefined,
    code: undefined,
    TYPE: undefined,
    type: undefined,
    workcenterAccess: undefined,
  };

  return {
    eventId,
    featureType,
    featureCategory,
    name,
    code,
    geometry: geometry as any, // PostGIS geometry
    properties: additionalProps,
    workcenterAccess: Array.isArray(workcenterAccess) ? workcenterAccess : [workcenterAccess],
    status: props.status || 'pending',
    completionPercent: props.completionPercent || 0,
  };
}

/**
 * Infer feature type from properties or geometry
 */
function inferFeatureType(props: any, defaultType: VenueFeatureType): VenueFeatureType {
  // Check explicit type property
  if (props.featureType || props.feature_type) {
    return props.featureType || props.feature_type;
  }

  // Check common type indicators
  if (props.TYPE === 'CPN') return 'zone'; // Burning Man CPNs are points of interest

  // Infer from name patterns
  const nameLower = (props.NAME || props.name || '').toLowerCase();

  if (nameLower.includes('stage')) return 'stage';
  if (nameLower.includes('gate') || nameLower.includes('portal')) return 'gate';
  if (nameLower.includes('vendor') || nameLower.includes('booth')) return 'vendor_booth';
  if (nameLower.includes('toilet') || nameLower.includes('restroom')) return 'restroom';
  if (nameLower.includes('plaza') || nameLower.includes('promenade')) return 'zone';
  if (nameLower.includes('medical') || nameLower.includes('heat')) return 'medical_tent';
  if (nameLower.includes('security') || nameLower.includes('ranger')) return 'security_post';
  if (nameLower.includes('water') || nameLower.includes('arctica') || nameLower.includes('ice')) return 'water_station';
  if (nameLower.includes('fence') || nameLower.includes('boundary')) return 'fence';
  if (nameLower.includes('street') || nameLower.includes('road')) return 'road';
  if (nameLower.includes('pathway') || nameLower.includes('path')) return 'pathway';

  return defaultType;
}

/**
 * Infer feature category (workcenter) from feature type
 */
function inferFeatureCategory(featureType: VenueFeatureType, props: any): string | undefined {
  if (props.featureCategory || props.feature_category) {
    return props.featureCategory || props.feature_category;
  }

  // Map feature types to workcenters
  const categoryMap: Record<string, string> = {
    stage: 'production',
    sound_booth: 'production',
    gate: 'security',
    security_post: 'security',
    vendor_booth: 'vendors',
    medical_tent: 'operations',
    restroom: 'operations',
    water_station: 'operations',
    art_installation: 'sponsors',
    vip_area: 'sponsors',
    command_center: 'operations',
    production_office: 'production',
  };

  return categoryMap[featureType] || 'operations';
}

/**
 * Convert GeoJSON geometry to PostGIS-compatible format
 */
function convertGeometry(geometry: Geometry): object {
  // PostGIS uses GeoJSON format, so we can pass through
  // But ensure it's properly formatted
  return {
    type: geometry.type,
    coordinates: geometry.coordinates,
  };
}

/**
 * Validate GeoJSON structure
 */
export function validateGeoJSON(data: any): data is FeatureCollection {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (data.type !== 'FeatureCollection') {
    return false;
  }

  if (!Array.isArray(data.features)) {
    return false;
  }

  // Validate each feature
  return data.features.every((feature: any) => validateFeature(feature));
}

/**
 * Validate a single GeoJSON Feature
 */
export function validateFeature(feature: any): feature is Feature {
  if (!feature || typeof feature !== 'object') {
    return false;
  }

  if (feature.type !== 'Feature') {
    return false;
  }

  if (!feature.geometry || !feature.geometry.type) {
    return false;
  }

  const validGeometryTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];

  if (!validGeometryTypes.includes(feature.geometry.type)) {
    return false;
  }

  if (!Array.isArray(feature.geometry.coordinates)) {
    return false;
  }

  return true;
}

/**
 * Extract feature statistics from GeoJSON
 */
export function getGeoJSONStats(geojson: FeatureCollection): {
  totalFeatures: number;
  byGeometryType: Record<string, number>;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    center: { lat: number; lng: number };
  } | null;
} {
  const stats = {
    totalFeatures: geojson.features.length,
    byGeometryType: {} as Record<string, number>,
    bounds: null as any,
  };

  // Count by geometry type
  for (const feature of geojson.features) {
    const type = feature.geometry.type;
    stats.byGeometryType[type] = (stats.byGeometryType[type] || 0) + 1;
  }

  // Calculate bounds
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const feature of geojson.features) {
    const coords = extractAllCoordinates(feature.geometry);
    for (const [lng, lat] of coords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }

  if (isFinite(minLat)) {
    stats.bounds = {
      minLat,
      maxLat,
      minLng,
      maxLng,
      center: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2,
      },
    };
  }

  return stats;
}

/**
 * Extract all coordinates from a geometry (recursive for nested types)
 */
function extractAllCoordinates(geometry: Geometry): number[][] {
  const coords: number[][] = [];

  function extract(coords: any) {
    if (Array.isArray(coords)) {
      if (typeof coords[0] === 'number') {
        // This is a coordinate pair [lng, lat]
        return [coords];
      } else {
        // Nested, recurse
        return coords.flatMap(extract);
      }
    }
    return [];
  }

  return extract(geometry.coordinates);
}
