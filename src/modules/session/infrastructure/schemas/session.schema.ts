import { randomUUID } from 'node:crypto';

import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { enterpriseUsersSchema } from '@/modules/enterprise-user/infrastructure/schemas';

export const sessionsSchema = pgTable('sessions', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  userId: text('user_id')
    .references(() => enterpriseUsersSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  hash: text('hash').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessionsRelations = relations(sessionsSchema, ({ one }) => ({
  user: one(enterpriseUsersSchema, {
    fields: [sessionsSchema.userId],
    references: [enterpriseUsersSchema.id],
  }),
}));
