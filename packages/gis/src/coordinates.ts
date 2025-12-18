import * as THREE from 'three';

/**
 * Convert lat/lng coordinates to Three.js 3D space
 * Uses a simplified Mercator-like projection
 *
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param altitude Height above ground (optional)
 * @param scaleFactor Scale multiplier for coordinates (default: 1000)
 * @returns THREE.Vector3 position
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  altitude: number = 0,
  scaleFactor: number = 1000
): THREE.Vector3 {
  // Simple planar projection (good for small areas like festival venues)
  const x = lng * scaleFactor;
  const z = -lat * scaleFactor; // Negate to match typical map orientation
  const y = altitude;

  return new THREE.Vector3(x, y, z);
}

/**
 * Convert Three.js coordinates back to lat/lng
 *
 * @param vector THREE.Vector3 position
 * @param scaleFactor Scale multiplier (must match conversion)
 * @returns {lat, lng, altitude}
 */
export function vector3ToLatLng(
  vector: THREE.Vector3,
  scaleFactor: number = 1000
): { lat: number; lng: number; altitude: number } {
  return {
    lng: vector.x / scaleFactor,
    lat: -vector.z / scaleFactor,
    altitude: vector.y,
  };
}

/**
 * Calculate bounding box from an array of coordinates
 *
 * @param coordinates Array of [lng, lat] pairs
 * @returns Bounding box {minLat, maxLat, minLng, maxLng, center}
 */
export function calculateBounds(coordinates: number[][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  center: { lat: number; lng: number };
} {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return {
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

/**
 * Calculate the center point of a venue from GeoJSON coordinates
 *
 * @param coordinates GeoJSON coordinates (any type)
 * @returns Center point {lat, lng}
 */
export function calculateCenter(coordinates: any): { lat: number; lng: number } {
  const flatCoords: number[][] = [];

  function flatten(coords: any): void {
    if (Array.isArray(coords[0])) {
      if (typeof coords[0][0] === 'number') {
        // This is an array of coordinate pairs
        coords.forEach((coord: number[]) => flatCoords.push(coord));
      } else {
        // Nested array, recurse
        coords.forEach(flatten);
      }
    } else if (typeof coords[0] === 'number') {
      // Single coordinate pair
      flatCoords.push(coords as number[]);
    }
  }

  flatten(coordinates);

  const bounds = calculateBounds(flatCoords);
  return bounds.center;
}

/**
 * Calculate appropriate scale factor based on venue bounds
 * This ensures the venue fits well in the viewport
 *
 * @param bounds Venue bounding box
 * @param targetSize Desired size in Three.js units (default: 1000)
 * @returns Optimal scale factor
 */
export function calculateScaleFactor(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  targetSize: number = 1000
): number {
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const maxSpan = Math.max(latSpan, lngSpan);

  // Calculate scale to fit venue in target size
  return targetSize / maxSpan;
}

/**
 * Convert GeoJSON Point coordinates to Three.js Vector3
 *
 * @param coordinates GeoJSON Point coordinates [lng, lat, altitude?]
 * @param scaleFactor Scale multiplier
 * @returns THREE.Vector3
 */
export function pointToVector3(
  coordinates: number[],
  scaleFactor: number = 1000
): THREE.Vector3 {
  const [lng, lat, altitude = 0] = coordinates;
  return latLngToVector3(lat, lng, altitude, scaleFactor);
}

/**
 * Convert GeoJSON LineString coordinates to array of THREE.Vector3
 *
 * @param coordinates GeoJSON LineString coordinates [[lng, lat], ...]
 * @param scaleFactor Scale multiplier
 * @returns Array of THREE.Vector3
 */
export function lineStringToVectors(
  coordinates: number[][],
  scaleFactor: number = 1000
): THREE.Vector3[] {
  return coordinates.map(([lng, lat, altitude = 0]) =>
    latLngToVector3(lat, lng, altitude, scaleFactor)
  );
}

/**
 * Convert GeoJSON Polygon coordinates to array of THREE.Vector3
 * (outer ring only, holes are ignored for simplicity)
 *
 * @param coordinates GeoJSON Polygon coordinates [[[lng, lat], ...]]
 * @param scaleFactor Scale multiplier
 * @returns Array of THREE.Vector3 (outer ring)
 */
export function polygonToVectors(
  coordinates: number[][][],
  scaleFactor: number = 1000
): THREE.Vector3[] {
  // Use only outer ring (first array)
  const outerRing = coordinates[0];
  return lineStringToVectors(outerRing, scaleFactor);
}
