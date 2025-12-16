import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AppBindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { events } from '../lib/schema';

const eventsRoutes = new Hono<AppBindings>();

// Apply auth middleware to all routes
eventsRoutes.use('/*', authMiddleware);

// Get all events
eventsRoutes.get(
  '/',
  requirePermission({ resource: 'events', action: 'read' }),
  async (c) => {
    try {
      const db = c.get('db');
      const allEvents = await db.select().from(events);
      return c.json({ events: allEvents });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return c.json({ error: 'Failed to fetch events' }, 500);
    }
  }
);

// Get event by ID
eventsRoutes.get(
  '/:id',
  requirePermission({ resource: 'events', action: 'read' }),
  async (c) => {
    try {
      const db = c.get('db');
      const id = c.req.param('id');
      const event = await db.select().from(events).where(eq(events.id, id)).limit(1);

      if (event.length === 0) {
        return c.json({ error: 'Event not found' }, 404);
      }

      return c.json({ event: event[0] });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      return c.json({ error: 'Failed to fetch event' }, 500);
    }
  }
);

// Create event (admin only)
eventsRoutes.post(
  '/',
  requirePermission({ resource: 'events', action: 'create' }),
  async (c) => {
    try {
      const db = c.get('db');
      const body = await c.req.json();

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

      return c.json({ event: newEvent[0] }, 201);
    } catch (error) {
      console.error('Failed to create event:', error);
      return c.json({ error: 'Failed to create event' }, 500);
    }
  }
);

export { eventsRoutes };

