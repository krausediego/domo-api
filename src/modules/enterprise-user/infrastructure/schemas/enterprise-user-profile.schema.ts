import { randomUUID } from 'node:crypto';

import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { enterpriseUsersSchema } from '.';

export const enterpriseUserProfilesSchema = pgTable(
  'enterprise_user_profiles',
  {
    id: text('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: text('user_id')
      .references(() => enterpriseUsersSchema.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    cellPhone: text('cell_phone').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
);

export const enterpriseUserProfilesRelations = relations(
  enterpriseUserProfilesSchema,
  ({ one }) => ({
    enterpriseUser: one(enterpriseUsersSchema, {
      fields: [enterpriseUserProfilesSchema.userId],
      references: [enterpriseUsersSchema.id],
    }),
  }),
);
