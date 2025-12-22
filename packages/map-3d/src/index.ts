// Main Components
export { VenueMap3D } from './components/VenueMap3D';
export { VenueObject } from './components/VenueObject';
export { FeatureDetailPanel } from './components/FeatureDetailPanel';

// Styled 3D Model Components
export { StageModel } from './components/StageModel';
export { FacilityModel } from './components/FacilityModel';
export { LandmarkModel } from './components/LandmarkModel';

// GIS Utilities
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

// Color & Model Utilities
export {
  getStatusColor,
  getFeatureColor,
  getModelCategory,
  getFeatureHeight,
  getFeatureSize,
  type ModelCategory,
} from './lib/colors';

// Re-export types for convenience
export type { VenueFeature, VenueFeatureType, VenueFeatureStatus } from '@c2/shared';
