'use client';

import type { Task, TaskStatus, TaskPriority } from '@c2/shared';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

const statusColors: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelled' },
};

const priorityColors: Record<TaskPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-100', text: 'text-slate-600' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

export function TaskCard({ task, onStatusChange, onEdit, compact = false }: TaskCardProps) {
  const status = statusColors[task.status];
  const priority = priorityColors[task.priority];

  if (compact) {
    return (
      <div
        className={`p-3 rounded-lg border-l-4 bg-white shadow-sm hover:shadow transition cursor-pointer ${
          task.status === 'blocked' ? 'border-l-red-500' :
          task.status === 'completed' ? 'border-l-green-500' :
          task.status === 'in_progress' ? 'border-l-blue-500' :
          'border-l-gray-300'
        }`}
        onClick={() => onEdit?.(task)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 truncate">{task.title}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text}`}>
            {task.priority}
          </span>
        </div>
        {task.dueDate && (
          <div className="text-xs text-gray-500 mt-1">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            {task.isCriticalPath && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                CRITICAL
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text} capitalize`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Progress and metadata */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {task.dueDate && (
            <span className="text-gray-500">
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.assignedTo && (
            <span className="text-gray-500">
              👤 {task.assignedTo}
            </span>
          )}
          {task.dependencies.length > 0 && (
            <span className="text-gray-500">
              🔗 {task.dependencies.length} dependencies
            </span>
          )}
        </div>
        {task.completionPercent > 0 && task.completionPercent < 100 && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${task.completionPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{task.completionPercent}%</span>
          </div>
        )}
      </div>

      {/* Blocked reason */}
      {task.status === 'blocked' && task.blockedReason && (
        <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
          ⚠️ {task.blockedReason}
        </div>
      )}

      {/* Actions */}
      {onStatusChange && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
          {task.status !== 'completed' && task.status !== 'cancelled' && (
            <>
              {task.status === 'pending' && (
                <button
                  onClick={() => onStatusChange(task.id, 'in_progress')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Start Task
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => onStatusChange(task.id, 'completed')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600 transition"
                >
                  Mark Complete
                </button>
              )}
              {task.status !== 'blocked' && (
                <button
                  onClick={() => onStatusChange(task.id, 'blocked')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Mark Blocked
                </button>
              )}
              {task.status === 'blocked' && (
                <button
                  onClick={() => onStatusChange(task.id, 'in_progress')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Unblock
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onEdit?.(task)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition ml-auto"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

