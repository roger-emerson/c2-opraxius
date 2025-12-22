import * as THREE from 'three';

/**
 * Convert lat/lng coordinates to Three.js 3D space
 * Uses a simplified Mercator-like projection
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  altitude: number = 0,
  scaleFactor: number = 1000
): THREE.Vector3 {
  const x = lng * scaleFactor;
  const z = -lat * scaleFactor;
  const y = altitude;
  return new THREE.Vector3(x, y, z);
}

/**
 * Convert GeoJSON Point coordinates to Three.js Vector3
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
 */
export function polygonToVectors(
  coordinates: number[][][],
  scaleFactor: number = 1000
): THREE.Vector3[] {
  const outerRing = coordinates[0];
  return lineStringToVectors(outerRing, scaleFactor);
}

