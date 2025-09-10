import { randomUUID } from 'node:crypto';

import { relations, sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { enterprisesSchema } from '@/modules/enterprise/infrastructure';
import { sessionsSchema } from '@/modules/session/infrastructure';

import { enterpriseUserProfilesSchema } from './enterprise-user-profile.schema';

export const enterpriseUsersSchema = pgTable('enterprise_users', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  enterpriseId: text('enterprise_id')
    .references(() => enterprisesSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  blocked: boolean('blocked').notNull().default(false),
  tempPassword: boolean('temp_password').notNull().default(true),
  isSuperUser: boolean('is_super_user').notNull().default(false),
  emailConfirmed: boolean('email_confirmed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const enterpriseUsersRelations = relations(enterpriseUsersSchema, ({ one, many }) => ({
  enterprise: one(enterprisesSchema, {
    fields: [enterpriseUsersSchema.enterpriseId],
    references: [enterprisesSchema.id],
  }),
  sessions: many(sessionsSchema),
  enterpriseUserProfile: one(enterpriseUserProfilesSchema),
}));
