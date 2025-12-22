'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { WORKCENTERS } from '@c2/shared';
import type { Task, VenueFeatureCategory } from '@c2/shared';
import { ProgressBar, CriticalItemsPanel, ActivityFeed } from '@/components/dashboard';

interface WorkcenterProgress {
  workcenter: VenueFeatureCategory;
  total: number;
  completed: number;
  blocked: number;
  critical: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/tasks`);
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [apiUrl]);

  // Calculate overall stats
  const overallStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    critical: tasks.filter((t) => t.isCriticalPath && t.status !== 'completed').length,
  };

  const overallProgress = overallStats.total > 0
    ? Math.round((overallStats.completed / overallStats.total) * 100)
    : 0;

  // Calculate per-workcenter progress
  const workcenterProgress: WorkcenterProgress[] = (session?.user.workcenters || []).map((wc) => {
    const wcTasks = tasks.filter((t) => t.workcenter === wc);
    return {
      workcenter: wc as VenueFeatureCategory,
      total: wcTasks.length,
      completed: wcTasks.filter((t) => t.status === 'completed').length,
      blocked: wcTasks.filter((t) => t.status === 'blocked').length,
      critical: wcTasks.filter((t) => t.isCriticalPath && t.status !== 'completed').length,
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-foreground">
          Welcome back, {session?.user.name}
        </h1>
        <p className="text-muted-foreground mt-2">Opraxius C2 Dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overall Readiness */}
          <div className="bg-background border border-border p-6">
            <h2 className="font-display text-xl font-medium text-foreground mb-6">Overall Readiness</h2>
            
            {/* Main Progress Bar */}
            <div className="mb-6">
              <ProgressBar
                value={overallProgress}
                label="Event Readiness"
                color={overallProgress >= 80 ? '#0A0A0A' : overallProgress >= 50 ? '#666666' : '#999999'}
                size="lg"
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-background-subtle border border-border">
                <div className="text-3xl font-display font-medium text-foreground">{overallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-background-subtle border border-border">
                <div className="text-3xl font-display font-medium text-foreground">{overallStats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center p-4 bg-background-subtle border border-border">
                <div className="text-3xl font-display font-medium text-foreground">{overallStats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 bg-background-subtle border border-border">
                <div className="text-3xl font-display font-medium text-foreground">{overallStats.blocked}</div>
                <div className="text-sm text-destructive">Blocked</div>
              </div>
            </div>

            {/* Critical Path Alert */}
            {overallStats.critical > 0 && (
              <div className="p-4 bg-background-subtle border border-foreground flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-medium text-foreground">Critical Path Alert</div>
                  <div className="text-sm text-muted-foreground">
                    {overallStats.critical} critical path task{overallStats.critical !== 1 ? 's' : ''} require attention
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Workstream Progress */}
          <div className="bg-background border border-border p-6">
            <h2 className="font-display text-xl font-medium text-foreground mb-6">Workstream Progress</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-background-subtle w-1/4 mb-2" />
                    <div className="h-3 bg-background-subtle w-full" />
                  </div>
                ))}
              </div>
            ) : workcenterProgress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No workcenters assigned</p>
              </div>
            ) : (
              <div className="space-y-5">
                {workcenterProgress.map((wcp) => {
                  const wcDef = WORKCENTERS[wcp.workcenter];
                  const progress = wcp.total > 0 ? Math.round((wcp.completed / wcp.total) * 100) : 0;
                  
                  return (
                    <Link
                      key={wcp.workcenter}
                      href={`/dashboard/${wcp.workcenter}`}
                      className="block hover:bg-background-subtle -mx-2 px-2 py-2 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: wcDef.color }}
                          />
                          <span className="font-medium text-foreground">{wcDef.displayName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{wcp.completed}/{wcp.total}</span>
                          {wcp.blocked > 0 && (
                            <span className="px-2 py-0.5 bg-background-subtle border border-border text-xs">
                              {wcp.blocked} blocked
                            </span>
                          )}
                        </div>
                      </div>
                      <ProgressBar
                        value={progress}
                        color={wcDef.color}
                        showPercentage={false}
                        size="sm"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/map"
              className="block bg-background p-6 border border-border hover:border-foreground transition group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗺️</div>
              <h3 className="font-display text-xl font-medium text-foreground">3D Venue Map</h3>
              <p className="text-muted-foreground mt-2">
                Explore the festival venue in interactive 3D
              </p>
            </Link>

            <div className="block bg-background p-6 border border-border relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-1 bg-background-subtle border border-border text-xs text-muted-foreground">
                Phase 4
              </div>
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-display text-xl font-medium text-foreground">AI Assistant</h3>
              <p className="text-muted-foreground mt-2">
                Natural language task management with Claude
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Critical Items */}
          <CriticalItemsPanel tasks={tasks} maxItems={5} />

          {/* Activity Feed */}
          <ActivityFeed
            apiUrl={`${apiUrl}/api/activity`}
            maxItems={10}
          />
        </div>
      </div>
    </div>
  );
}
