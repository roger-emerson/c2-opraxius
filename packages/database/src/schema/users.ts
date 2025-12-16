import { pgTable, uuid, varchar, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: varchar('role', { length: 50 }).notNull(),
  workcenters: varchar('workcenters', { length: 100 }).array().notNull().default([]),
  permissions: jsonb('permissions').default({}).notNull(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).unique(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  auth0UserIdIdx: index('idx_users_auth0').on(table.auth0UserId),
  roleIdx: index('idx_users_role').on(table.role),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
