import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AppBindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { requirePermission, RBACService } from '../middleware/rbac';
import { tasks } from '../lib/schema';

const tasksRoutes = new Hono<AppBindings>();

// Apply auth middleware to all routes
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

      let query = db.select().from(tasks);

      if (eventId) {
        query = query.where(eq(tasks.eventId, eventId)) as typeof query;
      }

      const allTasks = await query;

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

export { tasksRoutes };

