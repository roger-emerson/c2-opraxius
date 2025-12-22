import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { AppBindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { requirePermission, RBACService } from '../middleware/rbac';
import { tasks } from '../lib/schema';

const tasksRoutes = new Hono<AppBindings>();

// PUBLIC: Get tasks without auth (for dashboard display)
tasksRoutes.get('/public', async (c) => {
  try {
    const db = c.get('db');
    const workcenter = c.req.query('workcenter');
    const limitStr = c.req.query('limit');
    const limit = limitStr ? Math.min(parseInt(limitStr, 10), 100) : 50;

    let result;
    if (workcenter) {
      result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.workcenter, workcenter))
        .orderBy(desc(tasks.updatedAt))
        .limit(limit);
    } else {
      result = await db
        .select()
        .from(tasks)
        .orderBy(desc(tasks.updatedAt))
        .limit(limit);
    }

    return c.json({ tasks: result });
  } catch (error) {
    console.error('Failed to fetch public tasks:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Apply auth middleware to remaining routes
tasksRoutes.use('/*', authMiddleware);

// Get tasks (filtered by user's workcenter access)
tasksRoutes.get(
  '/',
  requirePermission({ resource: 'tasks', action: 'read' }),
  async (c) => {
    try {
      const db = c.get('db');
      const user = c.get('user');
      const eventId = c.req.query('eventId');
      const workcenter = c.req.query('workcenter');

      let allTasks;
      
      if (eventId && workcenter) {
        allTasks = await db.select().from(tasks).where(
          and(eq(tasks.eventId, eventId), eq(tasks.workcenter, workcenter))
        );
      } else if (eventId) {
        allTasks = await db.select().from(tasks).where(eq(tasks.eventId, eventId));
      } else if (workcenter) {
        allTasks = await db.select().from(tasks).where(eq(tasks.workcenter, workcenter));
      } else {
        allTasks = await db.select().from(tasks);
      }

      // Filter tasks by user's workcenter access
      const filteredTasks = RBACService.filterTasksByWorkcenter(user, allTasks);

      return c.json({ tasks: filteredTasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return c.json({ error: 'Failed to fetch tasks' }, 500);
    }
  }
);

// Get task by ID
tasksRoutes.get(
  '/:id',
  requirePermission({ resource: 'tasks', action: 'read' }),
  async (c) => {
    try {
      const db = c.get('db');
      const user = c.get('user');
      const id = c.req.param('id');

      const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

      if (task.length === 0) {
        return c.json({ error: 'Task not found' }, 404);
      }

      // Check if user has access to this task's workcenter
      if (task[0].workcenter && !RBACService.hasWorkcenterAccess(user, task[0].workcenter)) {
        return c.json({ error: 'Access denied to this workcenter' }, 403);
      }

      return c.json({ task: task[0] });
    } catch (error) {
      console.error('Failed to fetch task:', error);
      return c.json({ error: 'Failed to fetch task' }, 500);
    }
  }
);

// Create task
tasksRoutes.post('/', async (c) => {
  try {
    const db = c.get('db');
    const user = c.get('user');
    const body = await c.req.json();

    // Check if user can create task in this workcenter
    if (!RBACService.canCreateTaskInWorkcenter(user, body.workcenter)) {
      return c.json({
        error: `You do not have permission to create tasks in ${body.workcenter} workcenter`,
      }, 403);
    }

    const newTask = await db
      .insert(tasks)
      .values({
        eventId: body.eventId,
        venueFeatureId: body.venueFeatureId,
        workcenter: body.workcenter,
        title: body.title,
        description: body.description,
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        isCriticalPath: body.isCriticalPath || false,
        assignedTo: body.assignedTo,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        createdBy: user.id,
      })
      .returning();

    return c.json({ task: newTask[0] }, 201);
  } catch (error) {
    console.error('Failed to create task:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Update task
tasksRoutes.patch('/:id', async (c) => {
  try {
    const db = c.get('db');
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();

    // Get existing task
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (existingTask.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Check if user can update task in this workcenter
    if (existingTask[0].workcenter && !RBACService.canUpdateTask(user, existingTask[0].workcenter)) {
      return c.json({
        error: `You do not have permission to update tasks in ${existingTask[0].workcenter} workcenter`,
      }, 403);
    }

    const updatedTask = await db
      .update(tasks)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return c.json({ task: updatedTask[0] });
  } catch (error) {
    console.error('Failed to update task:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// Delete task
tasksRoutes.delete('/:id', async (c) => {
  try {
    const db = c.get('db');
    const user = c.get('user');
    const id = c.req.param('id');

    // Get existing task
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (existingTask.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Check if user can delete task in this workcenter
    if (existingTask[0].workcenter && !RBACService.canDeleteTask(user, existingTask[0].workcenter)) {
      return c.json({
        error: `You do not have permission to delete tasks in ${existingTask[0].workcenter} workcenter`,
      }, 403);
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return c.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

export { tasksRoutes };

