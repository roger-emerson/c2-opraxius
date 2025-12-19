import type { FastifyInstance } from 'fastify';
import { db, tasks } from '@c2/database';
import { eq, and } from 'drizzle-orm';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { RBACService } from '../services/rbac.service.js';

export async function tasksRoutes(fastify: FastifyInstance) {
  // Get tasks (filtered by user's workcenter access)
  fastify.get(
    '/',
    {
      preHandler: [requireAuth, requirePermission({ resource: 'tasks', action: 'read' })],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { eventId } = request.query as { eventId?: string };

        let query = db.select().from(tasks);

        if (eventId) {
          query = query.where(eq(tasks.eventId, eventId)) as any;
        }

        const allTasks = await query;

        // Filter tasks by user's workcenter access
        const filteredTasks = RBACService.filterTasksByWorkcenter(request.user!, allTasks);

        return reply.send({ tasks: filteredTasks });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch tasks' });
      }
    }
  );

  // Get task by ID
  fastify.get(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission({ resource: 'tasks', action: 'read' })],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

        if (task.length === 0) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        // Check if user has access to this task's workcenter
        if (!RBACService.hasWorkcenterAccess(request.user!, task[0].workcenter)) {
          return reply.status(403).send({ error: 'Access denied to this workcenter' });
        }

        return reply.send({ task: task[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch task' });
      }
    }
  );

  // Create task
  fastify.post(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const body = request.body as any;

        // Check if user can create task in this workcenter
        if (!RBACService.canCreateTaskInWorkcenter(request.user!, body.workcenter)) {
          return reply.status(403).send({
            error: `You do not have permission to create tasks in ${body.workcenter} workcenter`,
          });
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
            createdBy: request.user!.id,
          })
          .returning();

        return reply.status(201).send({ task: newTask[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to create task' });
      }
    }
  );

  // Update task
  fastify.patch(
    '/:id',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const body = request.body as any;

        // Get existing task
        const existingTask = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

        if (existingTask.length === 0) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        // Check if user can update task in this workcenter
        if (!RBACService.canUpdateTask(request.user!, existingTask[0].workcenter)) {
          return reply.status(403).send({
            error: `You do not have permission to update tasks in ${existingTask[0].workcenter} workcenter`,
          });
        }

        const updatedTask = await db
          .update(tasks)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, id))
          .returning();

        return reply.send({ task: updatedTask[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to update task' });
      }
    }
  );
}
