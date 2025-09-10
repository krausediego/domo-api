import { randomUUID } from 'node:crypto';

import { relations, sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { rolePermissionsSchema } from '.';

export const rolesSchema = pgTable('roles', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const rolesRelations = relations(rolesSchema, ({ many }) => ({
  rolePermission: many(rolePermissionsSchema),
}));
