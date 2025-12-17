'use client';

import { X } from 'lucide-react';
import type { VenueFeature } from '@esg/shared';
import { useQuery } from '@tanstack/react-query';

interface FeatureDetailPanelProps {
  feature: VenueFeature;
  onClose: () => void;
}

export function FeatureDetailPanel({ feature, onClose }: FeatureDetailPanelProps) {
  // Fetch tasks for this feature
  const { data: tasks } = useQuery({
    queryKey: ['tasks', feature.id],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/tasks?venueFeatureId=${feature.id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl overflow-hidden flex flex-col animate-slide-in-right z-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium opacity-90 mb-1">
              {feature.featureType.replace('_', ' ').toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold">{feature.name}</h2>
            {feature.code && (
              <div className="text-sm opacity-75 mt-1">Code: {feature.code}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(feature.status)}`}>
            {feature.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Completion */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Completion</span>
            <span className="text-sm font-bold text-blue-600">
              {feature.completionPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${feature.completionPercent}%` }}
            />
          </div>
        </div>

        {/* Category */}
        {feature.featureCategory && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Category</div>
            <div className="text-gray-900 capitalize">{feature.featureCategory}</div>
          </div>
        )}

        {/* Workcenter Access */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Workcenter Access</div>
          <div className="flex flex-wrap gap-2">
            {feature.workcenterAccess.map((wc) => (
              <span
                key={wc}
                className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize"
              >
                {wc}
              </span>
            ))}
          </div>
        </div>

        {/* Properties */}
        {Object.keys(feature.properties || {}).length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">Additional Properties</div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {Object.entries(feature.properties || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">{key}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Tasks</div>
          {tasks?.tasks?.length > 0 ? (
            <div className="space-y-2">
              {tasks.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-lg p-3 border-l-4"
                  style={{ borderColor: getStatusColor(task.status) }}
                >
                  <div className="font-medium text-gray-900">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
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
            <div className="text-gray-500 text-sm italic">No tasks assigned</div>
          )}
        </div>

        {/* Geometry Info */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Geometry</div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              Type: <span className="font-medium text-gray-900">{feature.geometry.type}</span>
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
      return 'bg-gray-500/20 text-white';
    case 'in_progress':
      return 'bg-yellow-500/20 text-white';
    case 'completed':
      return 'bg-green-500/20 text-white';
    case 'blocked':
      return 'bg-red-500/20 text-white';
    default:
      return 'bg-gray-500/20 text-white';
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
      return 'bg-gray-100 text-gray-700';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'blocked':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-700';
    case 'medium':
      return 'bg-purple-100 text-purple-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    case 'critical':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
