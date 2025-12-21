'use client';

import type { Task } from '@c2/shared';

interface TaskDependenciesProps {
  task: Task;
  allTasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const statusColors = {
  pending: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
  cancelled: 'bg-gray-300',
};

export function TaskDependencies({ task, allTasks, onTaskClick }: TaskDependenciesProps) {
  // Find tasks that this task depends on
  const dependencies = task.dependencies
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter((t): t is Task => t !== undefined);

  // Find tasks that depend on this task
  const dependents = allTasks.filter((t) => t.dependencies.includes(task.id));

  // Calculate if this task is blocked by incomplete dependencies
  const blockedDeps = dependencies.filter((d) => d.status !== 'completed');
  const isBlockedByDeps = blockedDeps.length > 0 && task.status !== 'completed';

  if (dependencies.length === 0 && dependents.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">🔗 Dependencies</h4>

      {/* Blocked Warning */}
      {isBlockedByDeps && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          ⚠️ Waiting on {blockedDeps.length} task{blockedDeps.length !== 1 ? 's' : ''} to complete
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* This task depends on */}
        {dependencies.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Depends On ({dependencies.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {dependencies.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onTaskClick?.(dep)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
                >
                  <span className={`w-2 h-2 rounded-full ${statusColors[dep.status]}`} />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {dep.title}
                  </span>
                  {dep.status === 'completed' && (
                    <span className="text-green-500 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tasks that depend on this */}
        {dependents.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Blocking ({dependents.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {dependents.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onTaskClick?.(dep)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
                >
                  <span className={`w-2 h-2 rounded-full ${statusColors[dep.status]}`} />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {dep.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Critical Path Indicator */}
      {task.isCriticalPath && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <span className="font-bold">🎯 Critical Path</span>
          <span className="text-red-600">– Delays will impact event timeline</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple visualization of the critical path
 */
interface CriticalPathViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function CriticalPathView({ tasks, onTaskClick }: CriticalPathViewProps) {
  // Get only critical path tasks, sorted by their dependencies
  const criticalTasks = tasks
    .filter((t) => t.isCriticalPath)
    .sort((a, b) => {
      // If a depends on b, a comes after
      if (a.dependencies.includes(b.id)) return 1;
      if (b.dependencies.includes(a.id)) return -1;
      return 0;
    });

  if (criticalTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Critical Path</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No critical path tasks defined</p>
        </div>
      </div>
    );
  }

  const completedCount = criticalTasks.filter((t) => t.status === 'completed').length;
  const progress = Math.round((completedCount / criticalTasks.length) * 100);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🎯 Critical Path</h3>
        <span className="text-sm text-gray-500">
          {completedCount}/{criticalTasks.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task chain */}
      <div className="relative">
        {criticalTasks.map((task, index) => (
          <div key={task.id} className="relative pl-8 pb-6 last:pb-0">
            {/* Connector line */}
            {index < criticalTasks.length - 1 && (
              <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200" />
            )}

            {/* Status dot */}
            <div
              className={`absolute left-1 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                task.status === 'completed'
                  ? 'bg-green-500 border-green-500'
                  : task.status === 'in_progress'
                  ? 'bg-blue-500 border-blue-500'
                  : task.status === 'blocked'
                  ? 'bg-red-500 border-red-500'
                  : 'bg-white border-gray-300'
              }`}
            >
              {task.status === 'completed' && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>

            {/* Task content */}
            <button
              onClick={() => onTaskClick?.(task)}
              className="block w-full text-left hover:bg-gray-50 -ml-2 pl-2 -mr-2 pr-2 py-1 rounded transition"
            >
              <div className="font-medium text-gray-900">{task.title}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                <span className="capitalize">{task.workcenter}</span>
                {task.dueDate && (
                  <>
                    <span>•</span>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

