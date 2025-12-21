'use client';

import type { Task } from '@c2/shared';
import { TaskCard } from './TaskCard';

interface CriticalItemsPanelProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  maxItems?: number;
}

export function CriticalItemsPanel({ tasks, onTaskClick, maxItems = 5 }: CriticalItemsPanelProps) {
  // Filter for blocked, critical priority, or critical path tasks
  const criticalTasks = tasks
    .filter(
      (task) =>
        task.status === 'blocked' ||
        task.priority === 'critical' ||
        (task.isCriticalPath && task.status !== 'completed')
    )
    .sort((a, b) => {
      // Blocked first, then critical priority, then critical path
      if (a.status === 'blocked' && b.status !== 'blocked') return -1;
      if (b.status === 'blocked' && a.status !== 'blocked') return 1;
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (b.priority === 'critical' && a.priority !== 'critical') return 1;
      return 0;
    })
    .slice(0, maxItems);

  if (criticalTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Critical Items</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <p>No critical items at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🚨 Critical Items</h3>
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          {criticalTasks.length} items
        </span>
      </div>
      <div className="space-y-3">
        {criticalTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            compact
            onEdit={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}

