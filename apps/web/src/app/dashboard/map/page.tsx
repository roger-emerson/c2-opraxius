'use client';

import { useQuery } from '@tanstack/react-query';
import { VenueMap3D } from '@/components/map/VenueMap3D';
import type { VenueFeature } from '@c2/shared';

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-700 mb-2">Loading 3D Map...</div>
          <div className="text-gray-500">Fetching venue features</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600 mb-2">Error loading map</div>
          <div className="text-gray-600">{(error as Error).message}</div>
          <div className="mt-4 text-sm text-gray-500">
            Make sure the API server is running on port 3001
          </div>
        </div>
      </div>
    );
  }

  const features: VenueFeature[] = data?.features || [];

  if (features.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-700 mb-2">No venue features found</div>
          <div className="text-gray-600">Import GeoJSON data to get started</div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-left">
            <div className="font-semibold mb-2">To import data:</div>
            <code className="block bg-gray-800 text-white p-3 rounded">
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
