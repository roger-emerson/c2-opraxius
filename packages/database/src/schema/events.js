import { pgTable, uuid, varchar, timestamp, geometry } from 'drizzle-orm/pg-core';
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
//# sourceMappingURL=events.js.map