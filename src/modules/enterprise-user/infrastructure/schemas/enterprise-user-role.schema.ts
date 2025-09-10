import { randomUUID } from 'node:crypto';

import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { rolesSchema } from '@/database/schemas';

import { enterpriseUsersSchema } from './enterprise-user.schema';

export const enterpriseUserRolesSchema = pgTable('enterprise_user_roles', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  userId: text('user_id')
    .references(() => enterpriseUsersSchema.id, { onDelete: 'cascade' })
    .notNull(),
  roleId: text('role_id')
    .references(() => rolesSchema.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const enterpriseUserRolesRelations = relations(enterpriseUserRolesSchema, ({ one }) => ({
  user: one(enterpriseUsersSchema, {
    fields: [enterpriseUserRolesSchema.userId],
    references: [enterpriseUsersSchema.id],
  }),
  role: one(rolesSchema, {
    fields: [enterpriseUserRolesSchema.roleId],
    references: [rolesSchema.id],
  }),
}));
