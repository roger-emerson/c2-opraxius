'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VenueFeature } from '@c2/shared';
import { getModelCategory, getStatusColor, getFeatureHeight, getFeatureSize } from '../lib/colors';
import { StageModel } from './StageModel';
import { FacilityModel } from './FacilityModel';
import { LandmarkModel } from './LandmarkModel';

interface VenueObjectProps {
  feature: VenueFeature;
  onClick: () => void;
  isSelected: boolean;
  centerOffset: { lat: number; lng: number };
  scaleFactor: number;
}

/**
 * Convert coordinates to centered Three.js position
 */
function coordsToPosition(
  coords: number[],
  centerOffset: { lat: number; lng: number },
  scaleFactor: number
): THREE.Vector3 {
  const [lng, lat] = coords;
  // Subtract center to normalize around origin, then scale
  const x = (lng - centerOffset.lng) * scaleFactor;
  const z = -(lat - centerOffset.lat) * scaleFactor; // Negate for map orientation
  return new THREE.Vector3(x, 0, z);
}

/**
 * Convert polygon coordinates to centered Three.js vectors
 */
function polygonToVectorsCentered(
  coordinates: number[][][],
  centerOffset: { lat: number; lng: number },
  scaleFactor: number
): THREE.Vector3[] {
  const outerRing = coordinates[0];
  return outerRing.map(coords => coordsToPosition(coords, centerOffset, scaleFactor));
}

/**
 * Convert linestring coordinates to centered Three.js vectors
 */
function lineStringToVectorsCentered(
  coordinates: number[][],
  centerOffset: { lat: number; lng: number },
  scaleFactor: number
): THREE.Vector3[] {
  return coordinates.map(coords => coordsToPosition(coords, centerOffset, scaleFactor));
}

/**
 * VenueObject - Smart wrapper that selects the appropriate 3D model based on feature type
 * 
 * Model selection:
 * - stage, sound_booth, vip_area → StageModel
 * - vendor_booth, medical_tent, security_post, etc. → FacilityModel
 * - art_installation → LandmarkModel
 * - pathway, road, fence, etc. → InfrastructureGeometry (tubes/extrusions)
 */
export function VenueObject({ feature, onClick, isSelected, centerOffset, scaleFactor }: VenueObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Get the model category for this feature type
  const modelCategory = useMemo(() => getModelCategory(feature.featureType), [feature.featureType]);
  
  // Get position from geometry (centered around origin)
  const position = useMemo(() => {
    const geom = feature.geometry;
    
    if (geom.type === 'Point') {
      return coordsToPosition(geom.coordinates as number[], centerOffset, scaleFactor);
    } else if (geom.type === 'Polygon') {
      // Use centroid of polygon
      const vectors = polygonToVectorsCentered(geom.coordinates as number[][][], centerOffset, scaleFactor);
      if (vectors.length > 0) {
        const centroid = new THREE.Vector3();
        vectors.forEach(v => centroid.add(v));
        centroid.divideScalar(vectors.length);
        return centroid;
      }
    } else if (geom.type === 'LineString') {
      // Use midpoint of line
      const vectors = lineStringToVectorsCentered(geom.coordinates as number[][], centerOffset, scaleFactor);
      if (vectors.length > 0) {
        const midIndex = Math.floor(vectors.length / 2);
        return vectors[midIndex];
      }
    }
    
    return new THREE.Vector3(0, 0, 0);
  }, [feature.geometry, centerOffset, scaleFactor]);

  // Render styled models for Point geometries or use centroid for polygons
  if (modelCategory === 'stage') {
    return (
      <StageModel
        feature={feature}
        position={position}
        onClick={onClick}
        isSelected={isSelected}
      />
    );
  }

  if (modelCategory === 'facility') {
    return (
      <FacilityModel
        feature={feature}
        position={position}
        onClick={onClick}
        isSelected={isSelected}
      />
    );
  }

  if (modelCategory === 'landmark') {
    return (
      <LandmarkModel
        feature={feature}
        position={position}
        onClick={onClick}
        isSelected={isSelected}
      />
    );
  }

  // Infrastructure: render using geometry-based approach (paths, roads, fences, zones)
  return (
    <InfrastructureObject
      feature={feature}
      onClick={onClick}
      isSelected={isSelected}
      hovered={hovered}
      setHovered={setHovered}
      meshRef={meshRef}
      centerOffset={centerOffset}
      scaleFactor={scaleFactor}
    />
  );
}

/**
 * InfrastructureObject - Renders infrastructure features (paths, roads, fences, zones)
 * Uses geometry-based rendering: tubes for lines, extrusions for polygons
 */
function InfrastructureObject({
  feature,
  onClick,
  isSelected,
  hovered,
  setHovered,
  meshRef,
  centerOffset,
  scaleFactor,
}: {
  feature: VenueFeature;
  onClick: () => void;
  isSelected: boolean;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  meshRef: React.RefObject<THREE.Mesh>;
  centerOffset: { lat: number; lng: number };
  scaleFactor: number;
}) {
  // Get color based on status
  const color = useMemo(() => getStatusColor(feature.status), [feature.status]);

  // Pulse animation for selected feature
  useFrame((state) => {
    if (isSelected && meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  // Render different geometry based on geometry type
  const geometryElement = useMemo(() => {
    const geom = feature.geometry;

    if (geom.type === 'Point') {
      const position = coordsToPosition(geom.coordinates as number[], centerOffset, scaleFactor);
      const height = getFeatureHeight(feature.featureType);
      const size = getFeatureSize(feature.featureType);
      return (
        <group position={position.toArray()}>
          <boxGeometry args={[size, height, size]} />
        </group>
      );
    } else if (geom.type === 'Polygon') {
      const vectors = polygonToVectorsCentered(geom.coordinates as number[][][], centerOffset, scaleFactor);
      
      // Create shape from polygon
      const shape = new THREE.Shape();
      if (vectors.length > 0) {
        shape.moveTo(vectors[0].x, vectors[0].z);
        for (let i = 1; i < vectors.length; i++) {
          shape.lineTo(vectors[i].x, vectors[i].z);
        }
        shape.closePath();
      }

      const height = getFeatureHeight(feature.featureType);

      return (
        <group>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: height,
                bevelEnabled: false,
              },
            ]}
          />
        </group>
      );
    } else if (geom.type === 'LineString') {
      const vectors = lineStringToVectorsCentered(geom.coordinates as number[][], centerOffset, scaleFactor);
      
      // Create curve from points - need at least 2 points
      if (vectors.length < 2) {
        return (
          <group>
            <boxGeometry args={[10, 5, 10]} />
          </group>
        );
      }
      
      const curve = new THREE.CatmullRomCurve3(vectors);
      const width = getFeatureSize(feature.featureType);

      return (
        <group>
          <tubeGeometry args={[curve, 64, width / 2, 8, false]} />
        </group>
      );
    }

    // Default: render as small box at origin
    return (
      <group>
        <boxGeometry args={[10, 5, 10]} />
      </group>
    );
  }, [feature, centerOffset, scaleFactor]);

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        {geometryElement}
        <meshStandardMaterial
          color={hovered ? '#ff9800' : color}
          emissive={isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
          metalness={0.2}
          roughness={0.8}
          transparent={['zone', 'boundary', 'plaza'].includes(feature.featureType as string)}
          opacity={['zone', 'boundary', 'plaza'].includes(feature.featureType as string) ? 0.6 : 1}
        />
      </mesh>
    </group>
  );
}
