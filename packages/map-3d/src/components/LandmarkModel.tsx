'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { VenueFeature } from '@c2/shared';
import { getStatusColor, getFeatureColor } from '../lib/colors';

interface LandmarkModelProps {
  feature: VenueFeature;
  position: THREE.Vector3;
  onClick: () => void;
  isSelected: boolean;
  scale?: number;
}

/**
 * LandmarkModel - Renders art installations and special landmarks
 * 
 * Special handling for different landmark types:
 * - ferris_wheel: Rotating torus with gondolas
 * - art_installation: Wireframe octahedron with glow
 * - default: Floating geometric shape
 */
export function LandmarkModel({ feature, position, onClick, isSelected, scale = 1 }: LandmarkModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  // Get colors
  const statusColor = getStatusColor(feature.status);
  const featureColor = getFeatureColor(feature.featureType);

  // Determine landmark variant from name or properties
  const isFerrisWheel = useMemo(() => {
    const name = feature.name.toLowerCase();
    return name.includes('ferris') || name.includes('wheel') || feature.properties?.type === 'ferris_wheel';
  }, [feature]);

  // Rotation animation for ferris wheel
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (isFerrisWheel) {
        // Slow rotation for ferris wheel
        groupRef.current.rotation.z += delta * 0.2;
      } else if (isSelected) {
        // Gentle rotation for selected landmarks
        groupRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  return (
    <group
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
      {isFerrisWheel ? (
        <FerrisWheelModel
          groupRef={groupRef}
          isSelected={isSelected}
          hovered={hovered}
          statusColor={statusColor}
          featureColor={featureColor}
        />
      ) : (
        <ArtInstallationModel
          groupRef={groupRef}
          isSelected={isSelected}
          hovered={hovered}
          statusColor={statusColor}
          featureColor={featureColor}
          scale={scale}
        />
      )}

      {/* Floating Label */}
      <Text
        position={[0, isFerrisWheel ? 45 : 30, 0]}
        fontSize={6}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.4}
        outlineColor="#000000"
      >
        {feature.name}
      </Text>

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <Html distanceFactor={15} position={[0, isFerrisWheel ? 50 : 35, 0]}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg border border-white/20 whitespace-nowrap backdrop-blur-sm">
            <p className="font-bold text-sm">{feature.name}</p>
            <p className="text-xs text-white/60">Art Installation</p>
            <p className="text-xs mt-1 flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${
                feature.status === 'completed' ? 'bg-green-500' :
                feature.status === 'in_progress' ? 'bg-yellow-500' :
                feature.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="capitalize">{feature.status.replace('_', ' ')}</span>
            </p>
          </div>
        </Html>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[20, 22, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Ferris Wheel - Rotating torus with gondola boxes
 */
function FerrisWheelModel({
  groupRef,
  isSelected,
  hovered,
  statusColor,
  featureColor,
}: {
  groupRef: React.RefObject<THREE.Group>;
  isSelected: boolean;
  hovered: boolean;
  statusColor: string;
  featureColor: string;
}) {
  const wheelRadius = 25;
  const gondolaCount = 12;

  return (
    <group>
      {/* Support Structure */}
      <mesh position={[-8, 15, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[2, 35, 2]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[8, 15, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[2, 35, 2]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Rotating Wheel Group */}
      <group ref={groupRef} position={[0, 28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Main Wheel Ring */}
        <mesh>
          <torusGeometry args={[wheelRadius, 1, 16, 100]} />
          <meshStandardMaterial
            color={hovered ? '#ff9800' : statusColor}
            metalness={0.5}
            roughness={0.3}
            emissive={isSelected ? featureColor : '#000'}
            emissiveIntensity={isSelected ? 0.4 : 0}
          />
        </mesh>

        {/* Inner Spokes */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={`spoke-${i}`}
              position={[0, 0, 0]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[wheelRadius * 2, 0.5, 0.5]} />
              <meshStandardMaterial color="#666" metalness={0.4} roughness={0.5} />
            </mesh>
          );
        })}

        {/* Gondolas */}
        {[...Array(gondolaCount)].map((_, i) => {
          const angle = (i / gondolaCount) * Math.PI * 2;
          const x = Math.cos(angle) * wheelRadius;
          const y = Math.sin(angle) * wheelRadius;
          return (
            <mesh key={`gondola-${i}`} position={[x, y, 0]}>
              <boxGeometry args={[3, 4, 3]} />
              <meshStandardMaterial
                color={featureColor}
                emissive={featureColor}
                emissiveIntensity={0.3}
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Base Platform */}
      <mesh position={[0, 1, 0]} receiveShadow>
        <cylinderGeometry args={[15, 18, 2, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Art Installation - Wireframe octahedron with glow effects
 */
function ArtInstallationModel({
  groupRef,
  isSelected,
  hovered,
  statusColor,
  featureColor,
  scale,
}: {
  groupRef: React.RefObject<THREE.Group>;
  isSelected: boolean;
  hovered: boolean;
  statusColor: string;
  featureColor: string;
  scale: number;
}) {
  return (
    <Float
      speed={isSelected ? 3 : 2}
      rotationIntensity={isSelected ? 0.5 : 0.2}
      floatIntensity={isSelected ? 1 : 0.5}
    >
      <group ref={groupRef} scale={scale}>
        {/* Main Wireframe Shape */}
        <mesh position={[0, 15, 0]}>
          <octahedronGeometry args={[12, 0]} />
          <meshStandardMaterial
            color={hovered ? '#ff9800' : featureColor}
            wireframe
            emissive={featureColor}
            emissiveIntensity={isSelected ? 0.8 : 0.4}
          />
        </mesh>

        {/* Inner Solid Core */}
        <mesh position={[0, 15, 0]}>
          <octahedronGeometry args={[6, 0]} />
          <meshStandardMaterial
            color={statusColor}
            metalness={0.6}
            roughness={0.2}
            emissive={isSelected ? statusColor : '#000'}
            emissiveIntensity={isSelected ? 0.5 : 0}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Surrounding Particles */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 18;
          return (
            <mesh
              key={`particle-${i}`}
              position={[
                Math.cos(angle) * radius,
                15 + Math.sin(angle * 2) * 5,
                Math.sin(angle) * radius,
              ]}
            >
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshStandardMaterial
                color={featureColor}
                emissive={featureColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}

        {/* Base Pedestal */}
        <mesh position={[0, 2, 0]} receiveShadow>
          <cylinderGeometry args={[8, 10, 4, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

