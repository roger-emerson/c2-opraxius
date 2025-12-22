'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { WORKCENTERS } from '@c2/shared';
import type { Task, VenueFeatureCategory, TaskStatus } from '@c2/shared';
import {
  WorkcenterStats,
  TaskCard,
  TaskModal,
  CriticalItemsPanel,
  ActivityFeed,
} from '@/components/dashboard';

interface WorkcenterDashboardProps {
  workcenter: string;
}

export function WorkcenterDashboard({ workcenter }: WorkcenterDashboardProps) {
  const { data: session } = useSession();
  const wcDef = WORKCENTERS[workcenter as VenueFeatureCategory];
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchTasks = useCallback(async () => {
    try {
      // Use public tasks endpoint for workcenter-specific tasks
      const res = await fetch(`${apiUrl}/api/tasks/public?workcenter=${workcenter}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, workcenter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const method = taskData.id ? 'PATCH' : 'POST';
    const url = taskData.id ? `${apiUrl}/api/tasks/${taskData.id}` : `${apiUrl}/api/tasks`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...taskData,
        workcenter: workcenter as VenueFeatureCategory,
        eventId: 'default-event', // TODO: Get from context
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to save task');
    }

    await fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    await fetchTasks();
  };

  const openNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter((t) => t.status === filter);

  // All users can view workcenter tasks (read-only for non-members)
  const hasWriteAccess = session?.user.workcenters?.includes(workcenter as VenueFeatureCategory) || 
                         session?.user.role === 'admin';

  if (!wcDef) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workcenter Not Found</h2>
          <p className="text-gray-600">The workcenter "{workcenter}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{wcDef.displayName}</h1>
          <p className="text-gray-600 mt-1">{wcDef.description}</p>
        </div>
        {hasWriteAccess && (
          <button
            onClick={openNewTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>➕</span> New Task
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading tasks...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <WorkcenterStats
              workcenter={workcenter as VenueFeatureCategory}
              tasks={tasks}
            />

            {/* Task List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <div className="flex gap-2">
                  {(['all', 'pending', 'in_progress', 'completed', 'blocked'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        filter === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'all' ? 'All' : f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No tasks found</p>
                  {hasWriteAccess && (
                    <button
                      onClick={openNewTask}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create your first task
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={openEditTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Critical Items */}
            <CriticalItemsPanel
              tasks={tasks}
              onTaskClick={openEditTask}
            />

            {/* Activity Feed */}
            <ActivityFeed
              workcenter={workcenter}
              apiUrl={`${apiUrl}/api/activity`}
              maxItems={8}
              isPublic={true}
            />
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        workcenter={workcenter as VenueFeatureCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

