'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_blocked' | 'comment' | 'assignment';
  message: string;
  userId?: string;
  userName?: string;
  workcenter?: string;
  taskId?: string;
  taskTitle?: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities?: Activity[];
  workcenter?: string;
  maxItems?: number;
  apiUrl?: string;
  pollInterval?: number; // in milliseconds
}

const activityIcons: Record<Activity['type'], string> = {
  task_created: '➕',
  task_updated: '✏️',
  task_completed: '✅',
  task_blocked: '🚫',
  comment: '💬',
  assignment: '👤',
};

const activityColors: Record<Activity['type'], string> = {
  task_created: 'bg-blue-50 border-blue-200',
  task_updated: 'bg-yellow-50 border-yellow-200',
  task_completed: 'bg-green-50 border-green-200',
  task_blocked: 'bg-red-50 border-red-200',
  comment: 'bg-purple-50 border-purple-200',
  assignment: 'bg-indigo-50 border-indigo-200',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export function ActivityFeed({
  activities: propActivities,
  workcenter,
  maxItems = 10,
  apiUrl,
  pollInterval = 30000,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(propActivities || []);
  const [isLoading, setIsLoading] = useState(!propActivities);

  useEffect(() => {
    if (!apiUrl) return;

    const fetchActivities = async () => {
      try {
        const url = new URL(apiUrl);
        if (workcenter) url.searchParams.set('workcenter', workcenter);
        url.searchParams.set('limit', String(maxItems));

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, pollInterval);
    return () => clearInterval(interval);
  }, [apiUrl, workcenter, maxItems, pollInterval]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Activity Feed</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Activity Feed</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📋 Activity Feed</h3>
        {workcenter && (
          <span className="text-sm text-gray-500 capitalize">{workcenter}</span>
        )}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.slice(0, maxItems).map((activity) => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg border ${activityColors[activity.type]} transition hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{activityIcons[activity.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {activity.userName && <span>{activity.userName}</span>}
                  <span>•</span>
                  <span>{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

