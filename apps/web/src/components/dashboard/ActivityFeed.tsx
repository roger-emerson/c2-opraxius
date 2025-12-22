'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_blocked' | 'task_started' | 'comment' | 'assignment';
  message: string;
  userId?: string;
  userName?: string;
  workcenter?: string;
  taskId?: string;
  taskTitle?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities?: Activity[];
  workcenter?: string;
  maxItems?: number;
  apiUrl?: string;
  pollInterval?: number; // in milliseconds
  isPublic?: boolean; // Use public /live endpoint
}

const activityIcons: Record<string, string> = {
  task_created: '➕',
  task_updated: '✏️',
  task_completed: '✅',
  task_blocked: '🚫',
  task_started: '▶️',
  comment: '💬',
  assignment: '👤',
};

const activityColors: Record<string, string> = {
  task_created: 'border-l-blue-500 bg-blue-500/5',
  task_updated: 'border-l-yellow-500 bg-yellow-500/5',
  task_completed: 'border-l-green-500 bg-green-500/5',
  task_blocked: 'border-l-red-500 bg-red-500/5',
  task_started: 'border-l-purple-500 bg-purple-500/5',
  comment: 'border-l-indigo-500 bg-indigo-500/5',
  assignment: 'border-l-cyan-500 bg-cyan-500/5',
};

const workcenterColors: Record<string, string> = {
  operations: 'bg-blue-100 text-blue-700',
  production: 'bg-purple-100 text-purple-700',
  security: 'bg-red-100 text-red-700',
  workforce: 'bg-amber-100 text-amber-700',
  vendors: 'bg-green-100 text-green-700',
  marketing: 'bg-pink-100 text-pink-700',
  finance: 'bg-emerald-100 text-emerald-700',
  sponsors: 'bg-orange-100 text-orange-700',
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
  pollInterval = 15000, // Poll every 15 seconds for live feel
  isPublic = false,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(propActivities || []);
  const [isLoading, setIsLoading] = useState(!propActivities);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!apiUrl) return;

    const fetchActivities = async () => {
      try {
        // Use /live endpoint for public access
        const endpoint = isPublic ? apiUrl.replace('/api/activity', '/api/activity/live') : apiUrl;
        const url = new URL(endpoint);
        if (workcenter) url.searchParams.set('workcenter', workcenter);
        url.searchParams.set('limit', String(maxItems));

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
          setLastUpdate(new Date());
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
  }, [apiUrl, workcenter, maxItems, pollInterval, isPublic]);

  if (isLoading) {
    return (
      <div className="bg-background border border-border p-6">
        <h3 className="font-display text-lg font-medium text-foreground mb-4">🔴 Live Activity</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-background-subtle rounded w-3/4 mb-2" />
              <div className="h-3 bg-background-subtle rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-background border border-border p-6">
        <h3 className="font-display text-lg font-medium text-foreground mb-4">🔴 Live Activity</h3>
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">📭</div>
          <p>No recent activity</p>
          <p className="text-xs mt-2">Run db:seed-tasks to generate tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <h3 className="font-display text-lg font-medium text-foreground">Live Activity</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          Updated {formatTimeAgo(lastUpdate)}
        </span>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {activities.slice(0, maxItems).map((activity, idx) => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg border-l-4 ${activityColors[activity.type] || 'border-l-gray-300 bg-gray-50'} transition hover:shadow-sm`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{activityIcons[activity.type] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium truncate">{activity.taskTitle || activity.message}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {activity.workcenter && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${workcenterColors[activity.workcenter] || 'bg-gray-100 text-gray-700'}`}>
                      {activity.workcenter}
                    </span>
                  )}
                  {activity.metadata?.priority === 'critical' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                      Critical
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border text-center">
        <span className="text-xs text-muted-foreground">
          Showing {Math.min(activities.length, maxItems)} of {activities.length} activities
        </span>
      </div>
    </div>
  );
}

