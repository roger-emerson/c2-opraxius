'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { VenueFeature } from '@c2/shared';
import { getStatusColor, getFeatureColor } from '../lib/colors';

interface StageModelProps {
  feature: VenueFeature;
  position: THREE.Vector3;
  onClick: () => void;
  isSelected: boolean;
  scale?: number;
}

/**
 * StageModel - Renders stages, sound booths, and VIP areas as styled 3D buildings
 * 
 * Visual: Floating box structure with roof, accent pillars, and Float animation
 * Inspired by architectural prototype renders
 */
export function StageModel({ feature, position, onClick, isSelected, scale = 1 }: StageModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Get colors based on status and feature type
  const statusColor = getStatusColor(feature.status);
  const accentColor = getFeatureColor(feature.featureType);

  // Pulse animation for selected stages
  useFrame((state) => {
    if (groupRef.current && isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      groupRef.current.scale.setScalar(scale * pulse);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
  });

  // Scale dimensions based on feature type
  const isVIP = feature.featureType === 'vip_area';
  const isSoundBooth = feature.featureType === 'sound_booth';
  
  const baseWidth = isSoundBooth ? 15 : isVIP ? 20 : 40;
  const baseDepth = isSoundBooth ? 10 : isVIP ? 15 : 25;
  const baseHeight = isSoundBooth ? 12 : isVIP ? 10 : 25;

  return (
    <group
      ref={groupRef}
      position={position.toArray()}
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
    >
      <Float 
        speed={isSelected ? 3 : 1.5} 
        rotationIntensity={isSelected ? 0.3 : 0.1} 
        floatIntensity={isSelected ? 0.5 : 0.2}
      >
        {/* Main Structure */}
        <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[baseWidth, baseHeight, baseDepth]} />
          <meshStandardMaterial
            color={hovered ? '#ff9800' : statusColor}
            metalness={0.4}
            roughness={0.3}
            emissive={isSelected ? statusColor : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>

        {/* Left Accent Pillar */}
        <mesh position={[(baseWidth / 2) + 3, baseHeight * 0.4, 0]} castShadow>
          <boxGeometry args={[4, baseHeight * 0.8, baseDepth * 0.6]} />
          <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Right Accent Pillar */}
        <mesh position={[-(baseWidth / 2) - 3, baseHeight * 0.4, 0]} castShadow>
          <boxGeometry args={[4, baseHeight * 0.8, baseDepth * 0.6]} />
          <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, baseHeight + 3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[baseWidth * 0.7, 6, 4]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Stage Platform Base */}
        <mesh position={[0, 1, 0]} receiveShadow>
          <boxGeometry args={[baseWidth + 10, 2, baseDepth + 10]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.8} />
        </mesh>

        {/* Front LED Screen Area */}
        <mesh position={[0, baseHeight / 2, baseDepth / 2 + 0.5]}>
          <planeGeometry args={[baseWidth * 0.8, baseHeight * 0.6]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* Floating Label */}
      <Text
        position={[0, baseHeight + 15, 0]}
        fontSize={8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.5}
        outlineColor="#000000"
      >
        {feature.name}
      </Text>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseWidth * 0.8, baseWidth * 0.9, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <Html distanceFactor={15} position={[0, baseHeight + 25, 0]}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg border border-white/20 whitespace-nowrap backdrop-blur-sm">
            <p className="font-bold text-sm">{feature.name}</p>
            <p className="text-xs text-white/60 capitalize">{feature.featureType.replace('_', ' ')}</p>
            <p className="text-xs mt-1">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                feature.status === 'completed' ? 'bg-green-500' :
                feature.status === 'in_progress' ? 'bg-yellow-500' :
                feature.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              {feature.status.replace('_', ' ')}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

