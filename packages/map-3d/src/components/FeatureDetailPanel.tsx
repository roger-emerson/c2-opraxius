'use client';

import { X } from 'lucide-react';
import type { VenueFeature } from '@c2/shared';
import { useQuery } from '@tanstack/react-query';

interface FeatureDetailPanelProps {
  feature: VenueFeature;
  onClose: () => void;
  apiUrl?: string;
}

export function FeatureDetailPanel({ feature, onClose, apiUrl }: FeatureDetailPanelProps) {
  const baseUrl = apiUrl || (typeof window !== 'undefined' ? (window as any).__NEXT_PUBLIC_API_URL : '') || 'http://localhost:3001';
  
  // Fetch tasks for this feature
  const { data: tasks } = useQuery({
    queryKey: ['tasks', feature.id],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/api/tasks?venueFeatureId=${feature.id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  return (
    <div className="absolute top-16 right-40 w-72 max-h-[calc(100vh-8rem)] bg-black/85 backdrop-blur-xl text-white shadow-2xl overflow-hidden flex flex-col rounded-xl border border-white/20 z-20 animate-fade-in">
      {/* Header - Glassmorphism with gradient accent */}
      <div className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
              {feature.featureType.replace('_', ' ')}
            </div>
            <h2 className="text-lg font-bold text-white">{feature.name}</h2>
            {feature.code && (
              <div className="text-xs text-white/60 mt-1">Code: {feature.code}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(feature.status)}`}>
            {feature.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Content - Dark glassmorphism */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Completion */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">Completion</span>
            <span className="text-xs font-bold text-purple-400">
              {feature.completionPercent}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${feature.completionPercent}%` }}
            />
          </div>
        </div>

        {/* Category */}
        {feature.featureCategory && (
          <div>
            <div className="text-xs font-semibold text-white/70 mb-1">Category</div>
            <div className="text-white/90 capitalize text-sm">{feature.featureCategory}</div>
          </div>
        )}

        {/* Workcenter Access */}
        <div>
          <div className="text-xs font-semibold text-white/70 mb-2">Workcenter Access</div>
          <div className="flex flex-wrap gap-1.5">
            {feature.workcenterAccess.map((wc) => (
              <span
                key={wc}
                className="inline-block bg-white/10 text-white/80 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
              >
                {wc}
              </span>
            ))}
          </div>
        </div>

        {/* Properties */}
        {Object.keys(feature.properties || {}).length > 0 && (
          <div>
            <div className="text-xs font-semibold text-white/70 mb-2">Properties</div>
            <div className="bg-white/5 rounded-lg p-3 space-y-1.5">
              {Object.entries(feature.properties || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-white/50">{key}:</span>
                  <span className="text-white/90">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div>
          <div className="text-xs font-semibold text-white/70 mb-2">Tasks</div>
          {tasks?.tasks?.length > 0 ? (
            <div className="space-y-2">
              {tasks.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="bg-white/5 rounded-lg p-2.5 border-l-2"
                  style={{ borderColor: getStatusColor(task.status) }}
                >
                  <div className="font-medium text-white/90 text-sm">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-white/60 mt-1">{task.description}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/40 text-xs italic">No tasks assigned</div>
          )}
        </div>

        {/* Geometry Info */}
        <div>
          <div className="text-xs font-semibold text-white/70 mb-2">Geometry</div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/60">
              Type: <span className="font-medium text-white/90">{feature.geometry.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-gray-500/30 text-white border border-gray-500/30';
    case 'in_progress':
      return 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/30';
    case 'completed':
      return 'bg-green-500/30 text-green-300 border border-green-500/30';
    case 'blocked':
      return 'bg-red-500/30 text-red-300 border border-red-500/30';
    default:
      return 'bg-gray-500/30 text-white border border-gray-500/30';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return '#6b7280';
    case 'in_progress':
      return '#eab308';
    case 'completed':
      return '#22c55e';
    case 'blocked':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-gray-500/20 text-gray-300';
    case 'in_progress':
      return 'bg-yellow-500/20 text-yellow-300';
    case 'completed':
      return 'bg-green-500/20 text-green-300';
    case 'blocked':
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'low':
      return 'bg-blue-500/20 text-blue-300';
    case 'medium':
      return 'bg-purple-500/20 text-purple-300';
    case 'high':
      return 'bg-orange-500/20 text-orange-300';
    case 'critical':
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
}

