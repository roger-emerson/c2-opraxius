import { pgTable, uuid, varchar, timestamp, text, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { events } from './events';
export const workcenters = pgTable('workcenters', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 100 }),
    color: varchar('color', { length: 7 }),
    totalTasksCount: integer('total_tasks_count').default(0).notNull(),
    completedTasksCount: integer('completed_tasks_count').default(0).notNull(),
    completionPercent: decimal('completion_percent', { precision: 5, scale: 2 }).default('0').notNull(),
    status: varchar('status', { length: 50 }).default('on_track').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    eventIdIdx: index('idx_workcenters_event').on(table.eventId),
    nameIdx: index('idx_workcenters_name').on(table.name),
}));
//# sourceMappingURL=workcenters.js.map