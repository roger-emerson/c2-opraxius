// Components
export { VenueMap3D } from './components/VenueMap3D';
export { VenueObject } from './components/VenueObject';
export { FeatureDetailPanel } from './components/FeatureDetailPanel';

// Utilities
export {
  latLngToVector3,
  vector3ToLatLng,
  calculateBounds,
  calculateCenter,
  calculateScaleFactor,
  pointToVector3,
  lineStringToVectors,
  polygonToVectors,
} from './lib/gis-utils';

// Re-export types for convenience
export type { VenueFeature, VenueFeatureType, VenueFeatureStatus } from '@c2/shared';

