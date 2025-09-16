import { randomUUID } from 'node:crypto';

import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { permissionsSchema } from '@/database/schemas';

import { rolesSchema } from '.';

export const rolePermissionsSchema = pgTable('role_permissions', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  roleId: text('role_id')
    .references(() => rolesSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  permissionId: text('permission_id')
    .references(() => permissionsSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const rolePermissionsRelations = relations(rolePermissionsSchema, ({ one }) => ({
  role: one(rolesSchema, {
    fields: [rolePermissionsSchema.roleId],
    references: [rolesSchema.id],
  }),
  permission: one(permissionsSchema, {
    fields: [rolePermissionsSchema.permissionId],
    references: [permissionsSchema.id],
  }),
}));
