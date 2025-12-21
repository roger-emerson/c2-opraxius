import { Hono } from 'hono';
import { eq, desc, and } from 'drizzle-orm';
import type { AppBindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { RBACService } from '../middleware/rbac';
import { activityFeed } from '../lib/schema';

const activityRoutes = new Hono<AppBindings>();

// Apply auth middleware to all routes
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

