import { randomUUID } from 'node:crypto';

import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { enterprisesSchema, enterpriseUserRolesSchema } from '@/database/schemas';

import { rolePermissionsSchema } from '.';

export const rolesSchema = pgTable('roles', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  enterpriseId: text('enterprise_id')
    .references(() => enterprisesSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: text('name').notNull(),
  status: boolean('status').notNull().default(true),
  editable: boolean('editable').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const rolesRelations = relations(rolesSchema, ({ one, many }) => ({
  enterprise: one(enterprisesSchema, {
    fields: [rolesSchema.enterpriseId],
    references: [enterprisesSchema.id],
  }),
  rolePermission: many(rolePermissionsSchema),
  enterpriseUserRolesRelations: many(enterpriseUserRolesSchema),
}));
