'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import type { VenueFeature } from '@c2/shared';

// Loading component for 3D map
function Loading3D() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="text-center">
        <div className="text-2xl font-semibold text-white mb-2">Loading 3D Engine...</div>
        <div className="text-slate-400">Initializing Three.js & React Three Fiber</div>
      </div>
    </div>
  );
}

// Dynamically import the map component from @c2/map-3d package
const VenueMap3D = dynamic(
  () => import('@c2/map-3d').then(mod => mod.VenueMap3D),
  { 
    ssr: false,
    loading: () => <Loading3D />
  }
);

export default function MapPage() {
  // Fetch venue features
  const { data, isLoading, error } = useQuery({
    queryKey: ['venueFeatures'],
    queryFn: async () => {
      // Use public endpoint for map visualization (no auth required)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/venues/public`);

      if (!response.ok) {
        throw new Error(`Failed to fetch venue features: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-2xl font-semibold text-white mb-2">Loading 3D Map...</div>
          <div className="text-slate-400">Fetching venue features</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center max-w-lg p-6">
          <div className="text-2xl font-semibold text-red-400 mb-2">Error loading map</div>
          <div className="bg-red-900/30 border border-red-500 rounded p-4">
            <div className="text-red-300">{(error as Error).message}</div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Make sure the API server is running
          </div>
        </div>
      </div>
    );
  }

  const features: VenueFeature[] = data?.features || [];

  if (features.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center max-w-lg">
          <div className="text-2xl font-semibold text-white mb-2">No venue features found</div>
          <div className="text-slate-400 mb-4">Import GeoJSON data to get started</div>
          <div className="p-4 bg-slate-800 rounded-lg text-sm text-left border border-slate-700">
            <div className="font-semibold text-white mb-2">To import data:</div>
            <code className="block bg-slate-900 text-green-400 p-3 rounded font-mono text-xs">
              cd packages/gis<br />
              npm run import -- -f path/to/file.geojson -e EVENT_ID
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <VenueMap3D features={features} />
    </div>
  );
}
