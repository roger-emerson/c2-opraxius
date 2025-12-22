import { Hono } from 'hono';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import type { AppBindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { RBACService } from '../middleware/rbac';
import { activityFeed, tasks } from '../lib/schema';

const activityRoutes = new Hono<AppBindings>();

// PUBLIC: Get live task feed (no auth required)
activityRoutes.get('/live', async (c) => {
  try {
    const db = c.get('db');
    const limitStr = c.req.query('limit');
    const limit = limitStr ? Math.min(parseInt(limitStr, 10), 50) : 20;

    const activities = await db
      .select()
      .from(activityFeed)
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);

    const mapped = activities.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      userName: a.userName || 'System',
      workcenter: a.workcenter,
      taskId: a.taskId,
      taskTitle: a.taskTitle,
      timestamp: a.createdAt,
      metadata: a.metadata,
    }));

    return c.json({ activities: mapped });
  } catch (error) {
    console.error('Failed to fetch live feed:', error);
    return c.json({ error: 'Failed to fetch live feed' }, 500);
  }
});

// PUBLIC: Get task statistics by workcenter (no auth required)
activityRoutes.get('/stats', async (c) => {
  try {
    const db = c.get('db');

    // Get task counts by workcenter and status
    const taskStats = await db.execute(sql`
      SELECT 
        workcenter,
        status,
        COUNT(*) as count,
        AVG(CAST(completion_percent AS NUMERIC)) as avg_completion
      FROM tasks
      GROUP BY workcenter, status
      ORDER BY workcenter, status
    `);

    // Get total tasks by workcenter
    const workcenterTotals = await db.execute(sql`
      SELECT 
        workcenter,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN is_critical_path THEN 1 END) as critical_tasks,
        AVG(CAST(completion_percent AS NUMERIC)) as avg_completion,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
      FROM tasks
      GROUP BY workcenter
      ORDER BY workcenter
    `);

    // Get overall summary
    const overall = await db.execute(sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN is_critical_path THEN 1 END) as critical_total,
        COUNT(CASE WHEN is_critical_path AND status = 'completed' THEN 1 END) as critical_completed,
        AVG(CAST(completion_percent AS NUMERIC)) as avg_completion
      FROM tasks
    `);

    // Get recent activity count
    const recentActivity = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM activity_feed
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);

    return c.json({
      overall: overall.rows[0] || {},
      byWorkcenter: workcenterTotals.rows || [],
      detailedStats: taskStats.rows || [],
      recentActivityCount: recentActivity.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error('Failed to fetch task stats:', error);
    return c.json({ error: 'Failed to fetch task stats' }, 500);
  }
});

// Apply auth middleware to remaining routes
activityRoutes.use('/*', authMiddleware);

// Get activity feed (filtered by user's workcenter access)
activityRoutes.get('/', async (c) => {
  try {
    const db = c.get('db');
    const user = c.get('user');
    const workcenter = c.req.query('workcenter');
    const limitStr = c.req.query('limit');
    const limit = limitStr ? Math.min(parseInt(limitStr, 10), 100) : 20;

    let activities;

    if (workcenter) {
      activities = await db
        .select()
        .from(activityFeed)
        .where(eq(activityFeed.workcenter, workcenter))
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
    } else {
      activities = await db
        .select()
        .from(activityFeed)
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
    }

    // Filter by user's workcenter access (unless admin)
    const filteredActivities = user.role === 'admin'
      ? activities
      : activities.filter(
          (a) => !a.workcenter || user.workcenters.includes(a.workcenter)
        );

    // Map to frontend format
    const mapped = filteredActivities.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      userId: a.userId,
      userName: a.userName,
      workcenter: a.workcenter,
      taskId: a.taskId,
      taskTitle: a.taskTitle,
      timestamp: a.createdAt,
    }));

    return c.json({ activities: mapped });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// Create activity (internal use, for logging task changes)
activityRoutes.post('/', async (c) => {
  try {
    const db = c.get('db');
    const user = c.get('user');
    const body = await c.req.json();

    const newActivity = await db
      .insert(activityFeed)
      .values({
        eventId: body.eventId,
        type: body.type,
        message: body.message,
        userId: user.id,
        userName: user.name,
        workcenter: body.workcenter,
        taskId: body.taskId,
        taskTitle: body.taskTitle,
        metadata: body.metadata || {},
      })
      .returning();

    return c.json({ activity: newActivity[0] }, 201);
  } catch (error) {
    console.error('Failed to create activity:', error);
    return c.json({ error: 'Failed to create activity' }, 500);
  }
});

export { activityRoutes };

