import { randomUUID } from 'node:crypto';

import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { rolePermissionsSchema } from '@/database/schemas';

export const permissionsSchema = pgTable('permissions', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const permissionsRelations = relations(permissionsSchema, ({ many }) => ({
  rolePermission: many(rolePermissionsSchema),
}));
