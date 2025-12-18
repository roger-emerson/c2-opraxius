import { pgTable, uuid, varchar, timestamp, text, jsonb, decimal, boolean, index, type PgColumn } from 'drizzle-orm/pg-core';
import { events } from './events';
import { venueFeatures } from './venues';
import { users } from './users';

export const tasks: any = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  venueFeatureId: uuid('venue_feature_id').references(() => venueFeatures.id, { onDelete: 'set null' }),
  workcenter: varchar('workcenter', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  isCriticalPath: boolean('is_critical_path').default(false).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  blockedReason: text('blocked_reason'),
  parentTaskId: uuid('parent_task_id').references(() => tasks.id),
  dependencies: uuid('dependencies').array().default([]).notNull(),
  completionPercent: decimal('completion_percent', { precision: 5, scale: 2 }).default('0').notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  eventIdIdx: index('idx_tasks_event').on(table.eventId),
  venueFeatureIdIdx: index('idx_tasks_feature').on(table.venueFeatureId),
  workcenterIdx: index('idx_tasks_workcenter').on(table.workcenter),
  statusIdx: index('idx_tasks_status').on(table.status),
  assignedToIdx: index('idx_tasks_assigned').on(table.assignedTo),
  dueDateIdx: index('idx_tasks_due_date').on(table.dueDate),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
