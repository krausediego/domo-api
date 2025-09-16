import { randomUUID } from 'node:crypto';

import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { enterpriseUsersSchema } from '@/modules/enterprise-user/infrastructure/schemas';

export const enterprisesSchema = pgTable('enterprises', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  name: text('name').notNull(),
  cellPhone: text('cell_phone').notNull(),
  email: text('email').notNull(),
  logoUrl: text('logo_url'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const enterprisesRelations = relations(enterprisesSchema, ({ many }) => ({
  enterpriseUsers: many(enterpriseUsersSchema),
}));
