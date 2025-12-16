import type { FastifyInstance } from 'fastify';
import { db, venueFeatures } from '@esg/database';
import { eq } from 'drizzle-orm';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { RBACService } from '../services/rbac.service.js';

export async function venuesRoutes(fastify: FastifyInstance) {
  // Get venue features (filtered by user's workcenter access)
  fastify.get(
    '/',
    {
      preHandler: [
        requireAuth,
        requirePermission({ resource: 'venue_features', action: 'read' }),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { eventId } = request.query as { eventId?: string };

        let query = db.select().from(venueFeatures);

        if (eventId) {
          query = query.where(eq(venueFeatures.eventId, eventId)) as any;
        }

        const allFeatures = await query;

        // Filter by user's workcenter access
        const filteredFeatures = RBACService.filterByWorkcenterAccess(request.user!, allFeatures);

        return reply.send({ features: filteredFeatures });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch venue features' });
      }
    }
  );

  // Get venue feature by ID
  fastify.get(
    '/:id',
    {
      preHandler: [
        requireAuth,
        requirePermission({ resource: 'venue_features', action: 'read' }),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const feature = await db
          .select()
          .from(venueFeatures)
          .where(eq(venueFeatures.id, id))
          .limit(1);

        if (feature.length === 0) {
          return reply.status(404).send({ error: 'Venue feature not found' });
        }

        // Check if user has access
        const filtered = RBACService.filterByWorkcenterAccess(request.user!, feature);

        if (filtered.length === 0) {
          return reply.status(403).send({ error: 'Access denied to this venue feature' });
        }

        return reply.send({ feature: feature[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch venue feature' });
      }
    }
  );

  // Create venue feature (admin or production/operations)
  fastify.post(
    '/',
    {
      preHandler: [
        requireAuth,
        requirePermission({ resource: 'venue_features', action: 'create' }),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const body = request.body as any;

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

        return reply.status(201).send({ feature: newFeature[0] });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to create venue feature' });
      }
    }
  );
}
