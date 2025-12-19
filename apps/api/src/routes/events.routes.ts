import type { FastifyInstance } from 'fastify';
import { db, events } from '@c2/database';
import { eq } from 'drizzle-orm';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';

export async function eventsRoutes(fastify: FastifyInstance) {
  // Get all events
  fastify.get(
    '/',
    {
      preHandler: [
        requireAuth,
        requirePermission({ resource: 'events', action: 'read' }),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const allEvents = await db.select().from(events);
        return reply.send({ events: allEvents });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch events' });
      }
    }
  );

  // Get event by ID
  fastify.get(
    '/:id',
    {
      preHandler: [
        requireAuth,
        requirePermission({ resource: 'events', action: 'read' }),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const event = await db.select().from(events).where(eq(events.id, id)).limit(1);

        if (event.length === 0) {
          return reply.status(404).send({ error: 'Event not found' });
        }

        return reply.send({ event: event[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch event' });
      }
    }
  );

  // Create event (admin only)
  fastify.post(
    '/',
    {
      preHandler: [
        requireAuth,
        requirePermission({ resource: 'events', action: 'create' }),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const body = request.body as any;

        const newEvent = await db
          .insert(events)
          .values({
            name: body.name,
            slug: body.slug,
            eventType: body.eventType,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            status: body.status || 'planning',
          })
          .returning();

        return reply.status(201).send({ event: newEvent[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to create event' });
      }
    }
  );
}
