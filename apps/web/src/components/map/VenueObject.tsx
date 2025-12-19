'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VenueFeature } from '@c2/shared';
import { pointToVector3, polygonToVectors, lineStringToVectors } from '@c2/gis';

interface VenueObjectProps {
  feature: VenueFeature;
  onClick: () => void;
  isSelected: boolean;
}

export function VenueObject({ feature, onClick, isSelected }: VenueObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Get color based on status
  const color = useMemo(() => getStatusColor(feature.status), [feature.status]);

  // Pulse animation for selected feature
  useFrame((state) => {
    if (isSelected && meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  // Render different geometry based on feature type
  const geometry = useMemo(() => {
    const geom = feature.geometry;

    if (geom.type === 'Point') {
      return renderPoint(feature);
    } else if (geom.type === 'Polygon') {
      return renderPolygon(feature);
    } else if (geom.type === 'LineString') {
      return renderLineString(feature);
    }

    // Default: render as point
    return renderPoint(feature);
  }, [feature]);

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
        {geometry}
        <meshStandardMaterial
          color={hovered ? '#ff9800' : color}
          emissive={isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Label */}
      {(hovered || isSelected) && (
        <sprite
          position={[
            0,
            getObjectHeight(feature) + 20,
            0,
          ]}
          scale={[100, 25, 1]}
        >
          <spriteMaterial color="#ffffff" opacity={0.9} />
        </sprite>
      )}
    </group>
  );
}

function renderPoint(feature: VenueFeature): JSX.Element {
  const coords = feature.geometry.coordinates as number[];
  const position = pointToVector3(coords);
  const height = getFeatureHeight(feature.featureType);
  const size = getFeatureSize(feature.featureType);

  return (
    <group position={position.toArray()}>
      <boxGeometry args={[size, height, size]} />
    </group>
  );
}

function renderPolygon(feature: VenueFeature): JSX.Element {
  const coords = feature.geometry.coordinates as number[][][];
  const vectors = polygonToVectors(coords);

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
}

function renderLineString(feature: VenueFeature): JSX.Element {
  const coords = feature.geometry.coordinates as number[][];
  const vectors = lineStringToVectors(coords);

  // Create curve from points
  const curve = new THREE.CatmullRomCurve3(vectors);
  const width = getFeatureSize(feature.featureType);

  return (
    <group>
      <tubeGeometry args={[curve, 64, width / 2, 8, false]} />
    </group>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return '#6b7280'; // gray
    case 'in_progress':
      return '#eab308'; // yellow
    case 'completed':
      return '#22c55e'; // green
    case 'blocked':
      return '#ef4444'; // red
    default:
      return '#6b7280';
  }
}

function getFeatureHeight(featureType: string): number {
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

function getFeatureSize(featureType: string): number {
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

function getObjectHeight(feature: VenueFeature): number {
  return getFeatureHeight(feature.featureType);
}
