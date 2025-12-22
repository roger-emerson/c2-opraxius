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
}

// Scale factor for coordinate conversion (larger = more spread out)
const SCALE_FACTOR = 100000;

export function VenueMap3D({ features, onFeatureClick }: VenueMap3DProps) {
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
    <div className="relative w-full h-full bg-[#050510]">
      <Canvas
        camera={{
          position: [0, 300, 400],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        shadows
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

        {/* Ground Grid */}
        <Grid
          args={[2000, 2000]}
          cellSize={20}
          cellThickness={0.5}
          cellColor="#1e1e3f"
          sectionSize={100}
          sectionThickness={1}
          sectionColor="#2d2d5a"
          fadeDistance={1000}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -1, 0]}>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#0a0a1a" roughness={0.9} metalness={0.1} />
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

      {/* Feature Detail Panel - Glassmorphism Style */}
      {selectedFeature && (
        <FeatureDetailPanel feature={selectedFeature} onClose={handleClosePanel} />
      )}

      {/* Controls Legend - Glassmorphism */}
      <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md text-white p-4 rounded-xl text-sm border border-white/10 shadow-2xl">
        <div className="font-semibold mb-3 text-white/90">Controls</div>
        <div className="space-y-1.5 text-white/70">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Left Click + Drag</span>
            <span>Rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Right Click + Drag</span>
            <span>Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Scroll</span>
            <span>Zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Click Object</span>
            <span>View Details</span>
          </div>
        </div>
      </div>

      {/* Status Legend - Glassmorphism */}
      <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md text-white p-4 rounded-xl text-sm border border-white/10 shadow-2xl">
        <div className="font-semibold mb-3 text-white/90">Status</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-500 shadow-lg shadow-gray-500/30" />
            <span className="text-white/70">Pending</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30" />
            <span className="text-white/70">In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
            <span className="text-white/70">Completed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
            <span className="text-white/70">Blocked</span>
          </div>
        </div>
      </div>

      {/* Feature Type Legend */}
      <div className="absolute bottom-6 right-6 flex gap-2 overflow-x-auto pb-2 max-w-[50vw]">
        {[
          { label: 'Stage', color: 'bg-pink-500' },
          { label: 'Facility', color: 'bg-amber-500' },
          { label: 'Art', color: 'bg-emerald-500' },
          { label: 'Medical', color: 'bg-red-500' },
          { label: 'Water', color: 'bg-sky-500' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full whitespace-nowrap"
          >
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-xs text-white/80 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Feature Count */}
      <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 shadow-2xl">
        <div className="text-2xl font-bold">{features.length}</div>
        <div className="text-xs text-white/50 uppercase tracking-wider">Features</div>
      </div>
    </div>
  );
}
