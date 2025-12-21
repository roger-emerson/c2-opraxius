import { pgTable, uuid, varchar, timestamp, geometry, jsonb, decimal, text, boolean, index } from 'drizzle-orm/pg-core';

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('planning'),
  venueBounds: geometry('venue_bounds', { type: 'polygon', mode: 'xy', srid: 4326 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Venue features table
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

// Users table (for references)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: varchar('role', { length: 50 }).notNull().default('viewer'),
  workcenters: varchar('workcenters', { length: 100 }).array().notNull().default([]),
  permissions: jsonb('permissions').default([]).notNull(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable('tasks', {
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
  parentTaskId: uuid('parent_task_id'),
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

// Activity feed table
export const activityFeed = pgTable('activity_feed', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  userId: uuid('user_id').references(() => users.id),
  userName: varchar('user_name', { length: 255 }),
  workcenter: varchar('workcenter', { length: 50 }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  taskTitle: varchar('task_title', { length: 500 }),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('idx_activity_event').on(table.eventId),
  typeIdx: index('idx_activity_type').on(table.type),
  workcenterIdx: index('idx_activity_workcenter').on(table.workcenter),
  createdAtIdx: index('idx_activity_created_at').on(table.createdAt),
}));

// Type exports
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type VenueFeature = typeof venueFeatures.$inferSelect;
export type NewVenueFeature = typeof venueFeatures.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Activity = typeof activityFeed.$inferSelect;
export type NewActivity = typeof activityFeed.$inferInsert;

