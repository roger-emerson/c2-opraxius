'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { VenueFeature } from '@c2/shared';
import { getStatusColor, getFeatureColor } from '../lib/colors';

interface FacilityModelProps {
  feature: VenueFeature;
  position: THREE.Vector3;
  onClick: () => void;
  isSelected: boolean;
  scale?: number;
}

/**
 * FacilityModel - Renders facilities as glowing cylinders with category colors
 * 
 * Used for: vendor_booth, medical_tent, security_post, restroom, water_station, 
 *           gate, command_center, production_office, warehouse, generator
 */
export function FacilityModel({ feature, position, onClick, isSelected, scale = 1 }: FacilityModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Get colors
  const statusColor = getStatusColor(feature.status);
  const featureColor = getFeatureColor(feature.featureType);

  // Glow animation
  useFrame((state) => {
    if (glowRef.current) {
      const intensity = isSelected 
        ? 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2
        : hovered 
          ? 0.5 
          : 0.2;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
    
    // Pulse scale for selected
    if (meshRef.current && isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale * pulse);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Scale based on feature type
  const getFacilitySize = () => {
    switch (feature.featureType) {
      case 'command_center':
        return { radius: 12, height: 20 };
      case 'warehouse':
        return { radius: 15, height: 15 };
      case 'production_office':
        return { radius: 10, height: 14 };
      case 'gate':
        return { radius: 8, height: 18 };
      case 'vendor_booth':
        return { radius: 6, height: 10 };
      case 'medical_tent':
        return { radius: 8, height: 8 };
      case 'security_post':
        return { radius: 5, height: 12 };
      case 'restroom':
        return { radius: 4, height: 6 };
      case 'water_station':
        return { radius: 5, height: 8 };
      case 'generator':
        return { radius: 6, height: 5 };
      default:
        return { radius: 6, height: 8 };
    }
  };

  const { radius, height } = getFacilitySize();

  // Get icon/category label
  const getCategoryIcon = () => {
    switch (feature.featureType) {
      case 'medical_tent': return '🏥';
      case 'security_post': return '🛡️';
      case 'restroom': return '🚻';
      case 'water_station': return '💧';
      case 'vendor_booth': return '🍔';
      case 'gate': return '🚪';
      case 'command_center': return '📡';
      case 'production_office': return '🎬';
      case 'warehouse': return '📦';
      case 'generator': return '⚡';
      default: return '📍';
    }
  };

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
      {/* Main Cylinder */}
      <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.2, height, 8]} />
        <meshStandardMaterial
          color={hovered ? '#ff9800' : statusColor}
          metalness={0.4}
          roughness={0.5}
          emissive={featureColor}
          emissiveIntensity={isSelected ? 0.5 : 0.15}
        />
      </mesh>

      {/* Glow Ring */}
      <mesh ref={glowRef} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.3, radius * 1.8, 32]} />
        <meshBasicMaterial
          color={featureColor}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top Cap with Icon Area */}
      <mesh position={[0, height + 1, 0]}>
        <cylinderGeometry args={[radius * 0.8, radius * 0.8, 2, 8]} />
        <meshStandardMaterial
          color={featureColor}
          emissive={featureColor}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Base Platform */}
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 1.5, radius * 1.5, 1, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Selection Indicator */}
      {isSelected && (
        <mesh position={[0, height + 5, 0]}>
          <sphereGeometry args={[3, 16, 16]} />
          <meshBasicMaterial color="white" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Always-visible category indicator */}
      <Html
        position={[0, height + 8, 0]}
        center
        distanceFactor={20}
        occlude={false}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-2xl select-none">{getCategoryIcon()}</div>
      </Html>

      {/* Hover/Selection Tooltip */}
      {(hovered || isSelected) && (
        <Html distanceFactor={15} position={[0, height + 15, 0]}>
          <div className="bg-black/90 text-white px-4 py-3 rounded-xl border border-white/20 whitespace-nowrap backdrop-blur-sm shadow-2xl min-w-[180px]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: featureColor }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                {feature.featureType.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="font-bold text-base">{feature.name}</p>
            
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  feature.status === 'completed' ? 'bg-green-500' :
                  feature.status === 'in_progress' ? 'bg-yellow-500' :
                  feature.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className="text-white/70 capitalize">{feature.status.replace('_', ' ')}</span>
              </div>
              
              {feature.completionPercent > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Progress</span>
                    <span>{feature.completionPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                      style={{ width: `${feature.completionPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

