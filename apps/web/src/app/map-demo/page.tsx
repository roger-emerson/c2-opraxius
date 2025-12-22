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

// Debug Panel Component
function DebugPanel({ 
  logs, 
  isOpen, 
  onToggle,
  reactVersion,
  threeLoaded,
  apiStatus,
  featureCount,
}: { 
  logs: DebugLog[];
  isOpen: boolean;
  onToggle: () => void;
  reactVersion: string;
  threeLoaded: boolean;
  apiStatus: string;
  featureCount: number;
}) {
  return (
    <div className="fixed bottom-0 right-0 z-50 max-w-lg w-full">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -top-10 right-4 bg-slate-800 text-white px-3 py-1 rounded-t text-sm font-mono border border-b-0 border-slate-600"
      >
        {isOpen ? '▼ Hide Debug' : '▲ Show Debug'}
      </button>
      
      {isOpen && (
        <div className="bg-slate-900 border-t border-slate-600 p-4 max-h-80 overflow-y-auto">
          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
            <div className="bg-slate-800 p-2 rounded">
              <span className="text-slate-400">React:</span>{' '}
              <span className="text-green-400">{reactVersion}</span>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <span className="text-slate-400">Three.js:</span>{' '}
              <span className={threeLoaded ? 'text-green-400' : 'text-yellow-400'}>
                {threeLoaded ? 'Loaded' : 'Loading...'}
              </span>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <span className="text-slate-400">API:</span>{' '}
              <span className={
                apiStatus === 'success' ? 'text-green-400' : 
                apiStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
              }>
                {apiStatus}
              </span>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <span className="text-slate-400">Features:</span>{' '}
              <span className="text-blue-400">{featureCount}</span>
            </div>
          </div>
          
          {/* Log Messages */}
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="font-mono text-xs flex">
                <span className="text-slate-500 mr-2">[{log.time}]</span>
                <span className={
                  log.level === 'success' ? 'text-green-400' :
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-yellow-400' :
                  'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
        <div className="flex items-center justify-center h-full bg-slate-900">
          <div className="text-center max-w-lg p-6">
            <div className="text-2xl font-semibold text-red-400 mb-4">3D Render Error</div>
            <div className="bg-red-900/30 border border-red-500 rounded p-4 text-left">
              <div className="font-mono text-sm text-red-300 break-all">
                {this.state.error?.message}
              </div>
              <div className="mt-2 font-mono text-xs text-red-400/70 break-all">
                {this.state.error?.stack?.split('\n').slice(0, 5).join('\n')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamically import the map component
const VenueMap3D = dynamic(
  () => import('@/components/map/VenueMap3D').then(mod => {
    return mod.VenueMap3D;
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-2xl font-semibold text-white mb-2">Loading 3D Engine...</div>
          <div className="text-slate-400">Initializing Three.js & React Three Fiber</div>
        </div>
      </div>
    )
  }
);

/**
 * Public demo page for the 3D map - NO AUTHENTICATION REQUIRED
 * Access at: /map-demo
 * 
 * Includes debug panel for real-time troubleshooting
 */
export default function MapDemoPage() {
  const [debugOpen, setDebugOpen] = useState(true);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [threeLoaded, setThreeLoaded] = useState(false);
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
    
    // Check if Three.js loads
    const checkThree = setTimeout(() => {
      try {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.THREE) {
          setThreeLoaded(true);
          addLog('success', 'Three.js global detected');
        }
      } catch (e) {
        addLog('warn', 'Three.js not on window (expected for bundled)');
      }
    }, 2000);

    return () => clearTimeout(checkThree);
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

  const features: VenueFeature[] = data?.features || [];
  const apiStatus = isLoading ? 'loading' : error ? 'error' : 'success';

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full relative bg-slate-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-2xl font-semibold text-white mb-2">Loading 3D Map...</div>
            <div className="text-slate-400">Fetching venue features</div>
          </div>
        </div>
        <DebugPanel 
          logs={logs} 
          isOpen={debugOpen} 
          onToggle={() => setDebugOpen(!debugOpen)}
          reactVersion={React.version}
          threeLoaded={threeLoaded}
          apiStatus={apiStatus}
          featureCount={0}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full relative bg-slate-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-lg p-6">
            <div className="text-2xl font-semibold text-red-400 mb-2">API Error</div>
            <div className="bg-red-900/30 border border-red-500 rounded p-4">
              <div className="text-red-300">{(error as Error).message}</div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Endpoint: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/venues/public
            </div>
          </div>
        </div>
        <DebugPanel 
          logs={logs} 
          isOpen={debugOpen} 
          onToggle={() => setDebugOpen(!debugOpen)}
          reactVersion={React.version}
          threeLoaded={threeLoaded}
          apiStatus={apiStatus}
          featureCount={0}
        />
      </div>
    );
  }

  // No features state
  if (features.length === 0) {
    return (
      <div className="h-screen w-full relative bg-slate-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-lg">
            <div className="text-2xl font-semibold text-white mb-2">No venue features found</div>
            <div className="text-slate-400 mb-4">Import GeoJSON data to get started</div>
          </div>
        </div>
        <DebugPanel 
          logs={logs} 
          isOpen={debugOpen} 
          onToggle={() => setDebugOpen(!debugOpen)}
          reactVersion={React.version}
          threeLoaded={threeLoaded}
          apiStatus={apiStatus}
          featureCount={0}
        />
      </div>
    );
  }

  // Three.js error state
  if (threeError) {
    return (
      <div className="h-screen w-full relative bg-slate-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-lg p-6">
            <div className="text-2xl font-semibold text-red-400 mb-4">3D Render Error</div>
            <div className="bg-red-900/30 border border-red-500 rounded p-4 text-left">
              <div className="font-mono text-sm text-red-300">{threeError}</div>
            </div>
            <div className="mt-4 text-slate-400">
              Features loaded: {features.length} | React: {React.version}
            </div>
          </div>
        </div>
        <DebugPanel 
          logs={logs} 
          isOpen={debugOpen} 
          onToggle={() => setDebugOpen(!debugOpen)}
          reactVersion={React.version}
          threeLoaded={threeLoaded}
          apiStatus={apiStatus}
          featureCount={features.length}
        />
      </div>
    );
  }

  // Success - render 3D map
  return (
    <div className="h-screen w-full relative">
      {/* Demo banner */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-700">
        <span className="font-semibold">C2 Opraxius</span>
        <span className="text-slate-400 ml-2">3D Map Demo</span>
        <span className="text-xs ml-3 px-2 py-0.5 bg-green-600 rounded">PUBLIC</span>
        <span className="text-xs ml-2 text-slate-500">{features.length} features</span>
      </div>
      
      <ThreeErrorBoundary onError={handleThreeError}>
        <VenueMap3D features={features} />
      </ThreeErrorBoundary>
      
      <DebugPanel 
        logs={logs} 
        isOpen={debugOpen} 
        onToggle={() => setDebugOpen(!debugOpen)}
        reactVersion={React.version}
        threeLoaded={threeLoaded}
        apiStatus={apiStatus}
        featureCount={features.length}
      />
    </div>
  );
}
