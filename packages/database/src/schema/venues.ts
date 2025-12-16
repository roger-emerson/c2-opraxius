import { pgTable, uuid, varchar, timestamp, geometry, jsonb, decimal, text, index } from 'drizzle-orm/pg-core';
import { events } from './events';

export const venueFeatures = pgTable('venue_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  featureType: varchar('feature_type', { length: 50 }).notNull(),
  featureCategory: varchar('feature_category', { length: 50 }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }),
  geometry: geometry('geometry', { type: 'geometry', mode: 'xy', srid: 4326 }).notNull(),
  properties: jsonb('properties').default({}).notNull(),
  workcenterAccess: varchar('workcenter_access', { length: 100 }).array().notNull().default([]),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  completionPercent: decimal('completion_percent', { precision: 5, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('idx_venue_features_event').on(table.eventId),
  featureTypeIdx: index('idx_venue_features_type').on(table.featureType),
  featureCategoryIdx: index('idx_venue_features_category').on(table.featureCategory),
  statusIdx: index('idx_venue_features_status').on(table.status),
}));

export type VenueFeature = typeof venueFeatures.$inferSelect;
export type NewVenueFeature = typeof venueFeatures.$inferInsert;
