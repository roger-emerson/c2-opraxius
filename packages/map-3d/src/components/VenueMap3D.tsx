'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows, Stars } from '@react-three/drei';
import { Suspense, useState, useMemo } from 'react';
import type { VenueFeature } from '@c2/shared';
import { VenueObject } from './VenueObject';
import { FeatureDetailPanel } from './FeatureDetailPanel';
import { calculateCenter } from '../lib/gis-utils';

interface VenueMap3DProps {
  features: VenueFeature[];
  onFeatureClick?: (feature: VenueFeature) => void;
  /** Slot for external header content (positioned top-left) */
  headerSlot?: React.ReactNode;
  /** Slot for external debug panel */
  debugSlot?: React.ReactNode;
}

// Scale factor for coordinate conversion (larger = more spread out)
const SCALE_FACTOR = 100000;

export function VenueMap3D({ features, onFeatureClick, headerSlot, debugSlot }: VenueMap3DProps) {
  const [selectedFeature, setSelectedFeature] = useState<VenueFeature | null>(null);

  // Calculate the center of all features to offset coordinates to origin
  const venueCenter = useMemo(() => {
    if (features.length === 0) return { lat: 0, lng: 0 };
    
    // Collect all coordinates from all features
    const allCoords: number[][] = [];
    features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      if (feature.geometry.type === 'Point') {
        allCoords.push(coords as number[]);
      } else if (feature.geometry.type === 'LineString') {
        (coords as number[][]).forEach(c => allCoords.push(c));
      } else if (feature.geometry.type === 'Polygon') {
        (coords as number[][][])[0]?.forEach(c => allCoords.push(c));
      }
    });
    
    if (allCoords.length === 0) return { lat: 0, lng: 0 };
    
    // Calculate average position
    const sum = allCoords.reduce((acc, [lng, lat]) => ({
      lng: acc.lng + lng,
      lat: acc.lat + lat
    }), { lng: 0, lat: 0 });
    
    return {
      lng: sum.lng / allCoords.length,
      lat: sum.lat / allCoords.length
    };
  }, [features]);

  const handleFeatureClick = (feature: VenueFeature) => {
    setSelectedFeature(feature);
    onFeatureClick?.(feature);
  };

  const handleClosePanel = () => {
    setSelectedFeature(null);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050510]">
      {/* 3D Canvas - Full Screen */}
      <Canvas
        className="!absolute !inset-0"
        camera={{
          position: [0, 300, 400],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        shadows
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {/* Ambient and Directional Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[200, 300, 200]}
          intensity={1}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-far={1500}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
        />
        <directionalLight position={[-200, 200, -200]} intensity={0.3} />
        
        {/* Colored accent lights for EDC vibe */}
        <pointLight position={[100, 50, 100]} intensity={0.5} color="#ff00ff" distance={300} />
        <pointLight position={[-100, 50, -100]} intensity={0.5} color="#00ffff" distance={300} />
        <pointLight position={[0, 100, 0]} intensity={0.3} color="#8b5cf6" distance={400} />

        {/* Stars background for night sky */}
        <Stars radius={2000} depth={100} count={3000} factor={6} saturation={0.5} fade speed={0.5} />

        {/* Ground Grid - Lighter for better contrast */}
        <Grid
          args={[2000, 2000]}
          cellSize={20}
          cellThickness={1}
          cellColor="#4a4a7a"
          sectionSize={100}
          sectionThickness={2}
          sectionColor="#6a6aaa"
          fadeDistance={1200}
          fadeStrength={0.8}
          followCamera={false}
          infiniteGrid
        />

        {/* Ground Plane - Slightly lighter to show grid better */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -1, 0]}>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#12122a" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Contact Shadows for grounded feel */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={1000}
          blur={2}
          far={100}
          resolution={512}
          color="#000000"
        />

        {/* Render all venue features with center offset */}
        <Suspense fallback={null}>
          {features.map((feature) => (
            <VenueObject
              key={feature.id}
              feature={feature}
              onClick={() => handleFeatureClick(feature)}
              isSelected={selectedFeature?.id === feature.id}
              centerOffset={venueCenter}
              scaleFactor={SCALE_FACTOR}
            />
          ))}
        </Suspense>

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.1} // Don't go underground
          minDistance={50}
          maxDistance={1500}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>

      {/* ===== UI OVERLAYS (all positioned absolutely within canvas) ===== */}

      {/* Header Slot - Top Left (if provided) */}
      {headerSlot && (
        <div className="absolute top-4 left-4 z-20">
          {headerSlot}
        </div>
      )}

      {/* Status Legend - Top Left (below header if present) */}
      <div className={`absolute ${headerSlot ? 'top-20' : 'top-4'} left-4 z-10 bg-black/70 backdrop-blur-md text-white p-3 rounded-xl text-sm border border-white/10 shadow-2xl`}>
        <div className="font-semibold mb-2 text-white/90 text-xs uppercase tracking-wider">Status</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-500 shadow-lg shadow-gray-500/30" />
            <span className="text-white/70 text-xs">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30" />
            <span className="text-white/70 text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
            <span className="text-white/70 text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
            <span className="text-white/70 text-xs">Blocked</span>
          </div>
        </div>
      </div>

      {/* Feature Type Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 max-w-xs">
        {[
          { label: 'Stage', color: 'bg-pink-500', shadow: 'shadow-pink-500/50' },
          { label: 'Facility', color: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
          { label: 'Art', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
          { label: 'Medical', color: 'bg-red-500', shadow: 'shadow-red-500/50' },
          { label: 'Water', color: 'bg-sky-500', shadow: 'shadow-sky-500/50' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-2 rounded-full shadow-lg"
          >
            <div className={`w-3 h-3 rounded-full ${item.color} shadow-md ${item.shadow}`} />
            <span className="text-sm text-white font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Controls Legend - Top Right */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-md text-white p-3 rounded-xl text-xs border border-white/10 shadow-2xl">
        <div className="font-semibold mb-2 text-white/90 uppercase tracking-wider">Controls</div>
        <div className="space-y-1 text-white/70">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Drag</span>
            <span>Rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Right+Drag</span>
            <span>Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Scroll</span>
            <span>Zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Click</span>
            <span>Select</span>
          </div>
        </div>
      </div>

      {/* Feature Detail Panel - Right Side (overlays canvas, not outside it) */}
      {selectedFeature && (
        <FeatureDetailPanel feature={selectedFeature} onClose={handleClosePanel} />
      )}

      {/* Debug Slot - Bottom Right (if provided) */}
      {debugSlot && (
        <div className="absolute bottom-4 right-4 z-30 max-w-sm">
          {debugSlot}
        </div>
      )}
    </div>
  );
}
