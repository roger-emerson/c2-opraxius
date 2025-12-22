'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import type { VenueFeature } from '@c2/shared';
import React from 'react';

// Debug log type
interface DebugLog {
  time: string;
  level: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

// Compact Debug Panel Component - designed to not interfere with map UI
function DebugPanel({ 
  logs, 
  isOpen, 
  onToggle,
  reactVersion,
  apiStatus,
  featureCount,
}: { 
  logs: DebugLog[];
  isOpen: boolean;
  onToggle: () => void;
  reactVersion: string;
  apiStatus: string;
  featureCount: number;
}) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="bg-black/70 backdrop-blur-md text-white/70 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 hover:bg-black/80 transition"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden w-72">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-mono text-white/70">Debug Panel</span>
        <button
          onClick={onToggle}
          className="text-white/50 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
      
      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-1 p-2 text-[10px] font-mono border-b border-white/10">
        <div className="bg-white/5 p-1.5 rounded text-center">
          <div className="text-white/50">React</div>
          <div className="text-green-400 truncate">{reactVersion.split('-')[0]}</div>
        </div>
        <div className="bg-white/5 p-1.5 rounded text-center">
          <div className="text-white/50">API</div>
          <div className={
            apiStatus === 'success' ? 'text-green-400' : 
            apiStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
          }>
            {apiStatus}
          </div>
        </div>
        <div className="bg-white/5 p-1.5 rounded text-center">
          <div className="text-white/50">Features</div>
          <div className="text-blue-400">{featureCount}</div>
        </div>
      </div>
      
      {/* Log Messages - Compact */}
      <div className="max-h-32 overflow-y-auto p-2 space-y-0.5">
        {logs.slice(-8).map((log, i) => (
          <div key={i} className="font-mono text-[10px] flex">
            <span className="text-white/30 mr-1.5">{log.time.split(':').slice(1).join(':')}</span>
            <span className={
              log.level === 'success' ? 'text-green-400' :
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warn' ? 'text-yellow-400' :
              'text-white/60'
            }>
              {log.message.length > 40 ? log.message.substring(0, 40) + '...' : log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error Boundary for Three.js
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError(error);
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050510]">
          <div className="text-center max-w-lg p-6">
            <div className="text-2xl font-semibold text-red-400 mb-4">3D Render Error</div>
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-left">
              <div className="font-mono text-sm text-red-300 break-all">
                {this.state.error?.message}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component for 3D map
function Loading3D() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050510]">
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

// Header component to pass as slot
function MapHeader({ featureCount }: { featureCount: number }) {
  return (
    <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3">
        <div>
          <span className="font-semibold">C2 Opraxius</span>
          <span className="text-white/50 ml-2 text-sm">3D Map</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-green-600/80 rounded font-medium">PUBLIC</span>
        <span className="text-xs text-white/40">{featureCount} features</span>
      </div>
    </div>
  );
}

/**
 * Public demo page for the 3D map - NO AUTHENTICATION REQUIRED
 * Access at: /map-demo
 */
export default function MapDemoPage() {
  const [debugOpen, setDebugOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [threeError, setThreeError] = useState<string | null>(null);

  // Add debug log
  const addLog = useCallback((level: DebugLog['level'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev.slice(-20), { time, level, message }]);
  }, []);

  // Log initial mount
  useEffect(() => {
    addLog('info', `Page mounted - React ${React.version}`);
    addLog('info', `API URL: ${process.env.NEXT_PUBLIC_API_URL || 'localhost:3001'}`);
  }, [addLog]);

  // Handle Three.js errors
  const handleThreeError = useCallback((error: Error) => {
    setThreeError(error.message);
    addLog('error', `Three.js Error: ${error.message}`);
  }, [addLog]);

  // Fetch venue features
  const { data, isLoading, error, status } = useQuery({
    queryKey: ['venueFeatures'],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      addLog('info', `Fetching: ${apiUrl}/api/venues/public`);
      
      const response = await fetch(`${apiUrl}/api/venues/public`);
      
      if (!response.ok) {
        const errorMsg = `API Error: ${response.status} ${response.statusText}`;
        addLog('error', errorMsg);
        throw new Error(errorMsg);
      }
      
      const json = await response.json();
      addLog('success', `API returned ${json.features?.length || 0} features`);
      
      // Transform features
      const features = (json.features || []).map((f: any) => ({
        ...f,
        completionPercent: Number(f.completionPercent) || 0,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
      }));
      
      // Log feature types
      const types = features.reduce((acc: Record<string, number>, f: any) => {
        acc[f.featureType] = (acc[f.featureType] || 0) + 1;
        return acc;
      }, {});
      addLog('info', `Types: ${Object.entries(types).map(([k, v]) => `${k}(${v})`).join(', ')}`);
      
      return { ...json, features };
    },
  });

  const features: VenueFeature[] = data?.features || [];
  const apiStatus = isLoading ? 'loading' : error ? 'error' : 'success';

  // Log status changes
  useEffect(() => {
    if (status === 'pending') addLog('info', 'Query: pending...');
    if (status === 'success') addLog('success', 'Query: success');
    if (status === 'error') addLog('error', `Query: error - ${(error as Error)?.message}`);
  }, [status, error, addLog]);

  // Log when ready to render 3D
  useEffect(() => {
    if (features.length > 0 && !threeError) {
      addLog('info', `Ready to render 3D map with ${features.length} features`);
    }
  }, [features.length, threeError, addLog]);

  // Full-screen container for all states
  const FullScreenContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-[#050510] overflow-hidden">
      {children}
      {/* Debug panel is always available */}
      <div className="fixed bottom-4 right-4 z-50">
        <DebugPanel 
          logs={logs} 
          isOpen={debugOpen} 
          onToggle={() => setDebugOpen(!debugOpen)}
          reactVersion={React.version}
          apiStatus={apiStatus}
          featureCount={features.length}
        />
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <FullScreenContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-white mb-2">Loading 3D Map...</div>
            <div className="text-slate-400">Fetching venue features</div>
          </div>
        </div>
      </FullScreenContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <FullScreenContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-lg p-6">
            <div className="text-2xl font-semibold text-red-400 mb-2">API Error</div>
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
              <div className="text-red-300">{(error as Error).message}</div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Endpoint: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/venues/public
            </div>
          </div>
        </div>
      </FullScreenContainer>
    );
  }

  // No features state
  if (features.length === 0) {
    return (
      <FullScreenContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <div className="text-2xl font-semibold text-white mb-2">No venue features found</div>
            <div className="text-slate-400 mb-4">Import GeoJSON data to get started</div>
          </div>
        </div>
      </FullScreenContainer>
    );
  }

  // Three.js error state
  if (threeError) {
    return (
      <FullScreenContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-lg p-6">
            <div className="text-2xl font-semibold text-red-400 mb-4">3D Render Error</div>
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-left">
              <div className="font-mono text-sm text-red-300">{threeError}</div>
            </div>
            <div className="mt-4 text-slate-400">
              Features loaded: {features.length} | React: {React.version}
            </div>
          </div>
        </div>
      </FullScreenContainer>
    );
  }

  // Success - render 3D map (fills entire viewport)
  return (
    <div className="fixed inset-0 overflow-hidden">
      <ThreeErrorBoundary onError={handleThreeError}>
        <VenueMap3D 
          features={features}
          headerSlot={<MapHeader featureCount={features.length} />}
          debugSlot={
            <DebugPanel 
              logs={logs} 
              isOpen={debugOpen} 
              onToggle={() => setDebugOpen(!debugOpen)}
              reactVersion={React.version}
              apiStatus={apiStatus}
              featureCount={features.length}
            />
          }
        />
      </ThreeErrorBoundary>
    </div>
  );
}
