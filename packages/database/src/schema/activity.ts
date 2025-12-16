import { pgTable, uuid, varchar, timestamp, text, jsonb, index } from 'drizzle-orm/pg-core';
import { events } from './events';
import { users } from './users';

export const activityFeed = pgTable('activity_feed', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  workcenter: varchar('workcenter', { length: 50 }),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  message: text('message').notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('idx_activity_event').on(table.eventId),
  workcenterIdx: index('idx_activity_workcenter').on(table.workcenter),
  createdAtIdx: index('idx_activity_created').on(table.createdAt),
  activityTypeIdx: index('idx_activity_type').on(table.activityType),
}));

export type ActivityFeedItem = typeof activityFeed.$inferSelect;
export type NewActivityFeedItem = typeof activityFeed.$inferInsert;
