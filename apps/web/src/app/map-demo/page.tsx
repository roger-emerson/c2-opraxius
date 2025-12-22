'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import type { VenueFeature } from '@c2/shared';

// Dynamically import the map component to avoid SSR issues with Three.js
const VenueMap3D = dynamic(
  () => import('@/components/map/VenueMap3D').then(mod => mod.VenueMap3D),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-2xl font-semibold text-white mb-2">Loading 3D Engine...</div>
          <div className="text-slate-400">Initializing Three.js</div>
        </div>
      </div>
    )
  }
);

/**
 * Public demo page for the 3D map - NO AUTHENTICATION REQUIRED
 * Access at: /map-demo
 */
export default function MapDemoPage() {
  // Fetch venue features from public API endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ['venueFeatures'],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('Fetching from:', `${apiUrl}/api/venues/public`);
      const response = await fetch(`${apiUrl}/api/venues/public`);

      if (!response.ok) {
        throw new Error(`Failed to fetch venue features: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      console.log('API Response:', json);
      
      // Transform features to ensure correct types
      const features = (json.features || []).map((f: any) => ({
        ...f,
        completionPercent: Number(f.completionPercent) || 0,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
      }));
      
      return { ...json, features };
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
        <div className="text-center max-w-lg">
          <div className="text-2xl font-semibold text-red-400 mb-2">Error loading map</div>
          <div className="text-slate-300">{(error as Error).message}</div>
          <div className="mt-4 text-sm text-slate-500">
            API endpoint: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
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
            <div className="font-semibold mb-2 text-slate-200">To import data:</div>
            <code className="block bg-slate-950 text-green-400 p-3 rounded font-mono text-xs">
              cd packages/gis<br />
              npm run import -- -f path/to/file.geojson -e EVENT_ID
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* Demo banner */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-700">
        <span className="font-semibold">C2 Opraxius</span>
        <span className="text-slate-400 ml-2">3D Map Demo</span>
        <span className="text-xs ml-3 px-2 py-0.5 bg-green-600 rounded">PUBLIC</span>
      </div>
      
      <VenueMap3D features={features} />
    </div>
  );
}

