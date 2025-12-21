'use client';

import { WORKCENTERS } from '@c2/shared';
import type { VenueFeatureCategory, Task } from '@c2/shared';
import { ProgressBar } from './ProgressBar';

interface WorkcenterStatsProps {
  workcenter: VenueFeatureCategory;
  tasks: Task[];
}

export function WorkcenterStats({ workcenter, tasks }: WorkcenterStatsProps) {
  const wcDef = WORKCENTERS[workcenter];
  
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    critical: tasks.filter((t) => t.isCriticalPath && t.status !== 'completed').length,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
          style={{ backgroundColor: wcDef.color }}
        >
          {wcDef.icon === 'settings' && '⚙️'}
          {wcDef.icon === 'construction' && '🔧'}
          {wcDef.icon === 'shield' && '🛡️'}
          {wcDef.icon === 'people' && '👥'}
          {wcDef.icon === 'store' && '🏪'}
          {wcDef.icon === 'handshake' && '🤝'}
          {wcDef.icon === 'campaign' && '📢'}
          {wcDef.icon === 'attach_money' && '💰'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{wcDef.displayName}</h2>
          <p className="text-sm text-gray-500">{wcDef.description}</p>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="mb-6">
        <ProgressBar
          value={completionRate}
          label="Overall Completion"
          color={wcDef.color}
          size="lg"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Tasks</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-blue-600 uppercase tracking-wide">In Progress</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-green-600 uppercase tracking-wide">Completed</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          <div className="text-xs text-red-600 uppercase tracking-wide">Blocked</div>
        </div>
      </div>

      {/* Critical Path Warning */}
      {stats.critical > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm text-red-700">
            {stats.critical} critical path task{stats.critical !== 1 ? 's' : ''} pending
          </span>
        </div>
      )}
    </div>
  );
}

