'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Suspense, useState } from 'react';
import type { VenueFeature } from '@c2/shared';
import { VenueObject } from './VenueObject';
import { FeatureDetailPanel } from './FeatureDetailPanel';

interface VenueMap3DProps {
  features: VenueFeature[];
  onFeatureClick?: (feature: VenueFeature) => void;
}

export function VenueMap3D({ features, onFeatureClick }: VenueMap3DProps) {
  const [selectedFeature, setSelectedFeature] = useState<VenueFeature | null>(null);

  const handleFeatureClick = (feature: VenueFeature) => {
    setSelectedFeature(feature);
    onFeatureClick?.(feature);
  };

  const handleClosePanel = () => {
    setSelectedFeature(null);
  };

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{
          position: [0, 500, 500],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[100, 100, 100]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-100, 100, -100]} intensity={0.3} />

        {/* Ground Grid */}
        <Grid
          args={[10000, 10000]}
          cellSize={50}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={250}
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={2000}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -1, 0]}>
          <planeGeometry args={[10000, 10000]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        {/* Render all venue features */}
        <Suspense fallback={null}>
          {features.map((feature) => (
            <VenueObject
              key={feature.id}
              feature={feature}
              onClick={() => handleFeatureClick(feature)}
              isSelected={selectedFeature?.id === feature.id}
            />
          ))}
        </Suspense>

        {/* Environment for reflections */}
        <Environment preset="sunset" />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.2} // Don't go underground
          minDistance={50}
          maxDistance={2000}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Feature Detail Panel */}
      {selectedFeature && (
        <FeatureDetailPanel feature={selectedFeature} onClose={handleClosePanel} />
      )}

      {/* Controls Legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="font-semibold mb-2">Controls:</div>
        <div>Left Click + Drag: Rotate</div>
        <div>Right Click + Drag: Pan</div>
        <div>Scroll: Zoom</div>
        <div>Click Object: View Details</div>
      </div>

      {/* Status Legend */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="font-semibold mb-2">Status Colors:</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>Blocked</span>
        </div>
      </div>

      {/* Feature Count */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm font-semibold">
        {features.length} Features
      </div>
    </div>
  );
}

