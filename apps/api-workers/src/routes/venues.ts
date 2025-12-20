import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AppBindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { requirePermission, RBACService } from '../middleware/rbac';
import { venueFeatures } from '../lib/schema';

const venuesRoutes = new Hono<AppBindings>();

// Public endpoint for map visualization (no auth required)
// This allows the 3D map to load venue features without authentication
venuesRoutes.get('/public', async (c) => {
  try {
    const db = c.get('db');
    const eventId = c.req.query('eventId');

    let query = db.select().from(venueFeatures);

    if (eventId) {
      query = query.where(eq(venueFeatures.eventId, eventId)) as typeof query;
    }

    const features = await query;

    return c.json({ features });
  } catch (error) {
    console.error('Failed to fetch public venue features:', error);
    return c.json({ error: 'Failed to fetch venue features' }, 500);
  }
});

// Apply auth middleware to protected routes
venuesRoutes.use('/*', authMiddleware);

// Get venue features (filtered by user's workcenter access)
venuesRoutes.get(
  '/',
  requirePermission({ resource: 'venue_features', action: 'read' }),
  async (c) => {
    try {
      const db = c.get('db');
      const user = c.get('user');
      const eventId = c.req.query('eventId');

      let query = db.select().from(venueFeatures);

      if (eventId) {
        query = query.where(eq(venueFeatures.eventId, eventId)) as typeof query;
      }

      const allFeatures = await query;

      // Filter by user's workcenter access
      const filteredFeatures = RBACService.filterByWorkcenterAccess(user, allFeatures);

      return c.json({ features: filteredFeatures });
    } catch (error) {
      console.error('Failed to fetch venue features:', error);
      return c.json({ error: 'Failed to fetch venue features' }, 500);
    }
  }
);

// Get venue feature by ID
venuesRoutes.get(
  '/:id',
  requirePermission({ resource: 'venue_features', action: 'read' }),
  async (c) => {
    try {
      const db = c.get('db');
      const user = c.get('user');
      const id = c.req.param('id');

      const feature = await db
        .select()
        .from(venueFeatures)
        .where(eq(venueFeatures.id, id))
        .limit(1);

      if (feature.length === 0) {
        return c.json({ error: 'Venue feature not found' }, 404);
      }

      // Check if user has access
      const filtered = RBACService.filterByWorkcenterAccess(user, feature);

      if (filtered.length === 0) {
        return c.json({ error: 'Access denied to this venue feature' }, 403);
      }

      return c.json({ feature: feature[0] });
    } catch (error) {
      console.error('Failed to fetch venue feature:', error);
      return c.json({ error: 'Failed to fetch venue feature' }, 500);
    }
  }
);

// Create venue feature (admin or production/operations)
venuesRoutes.post(
  '/',
  requirePermission({ resource: 'venue_features', action: 'create' }),
  async (c) => {
    try {
      const db = c.get('db');
      const body = await c.req.json();

      const newFeature = await db
        .insert(venueFeatures)
        .values({
          eventId: body.eventId,
          featureType: body.featureType,
          featureCategory: body.featureCategory,
          name: body.name,
          code: body.code,
          geometry: body.geometry,
          properties: body.properties || {},
          workcenterAccess: body.workcenterAccess || [],
          status: body.status || 'pending',
        })
        .returning();

      return c.json({ feature: newFeature[0] }, 201);
    } catch (error) {
      console.error('Failed to create venue feature:', error);
      return c.json({ error: 'Failed to create venue feature' }, 500);
    }
  }
);

export { venuesRoutes };

