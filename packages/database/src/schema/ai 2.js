import { pgTable, uuid, varchar, timestamp, text, jsonb, index } from 'drizzle-orm/pg-core';
import { events } from './events';
import { users } from './users';
export const aiChatHistory = pgTable('ai_chat_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').notNull(),
    role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
    message: text('message').notNull(),
    contextUsed: jsonb('context_used'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('idx_chat_user').on(table.userId),
    sessionIdIdx: index('idx_chat_session').on(table.sessionId),
    createdAtIdx: index('idx_chat_created').on(table.createdAt),
}));
//# sourceMappingURL=ai.js.map