import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { EnterpriseUser } from '@/modules/enterprise-user/domain';
import { UndefinedType } from '@/utils/types';

import { Session } from '../domain';

@Injectable()
export class SessionRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: Session['id']): Promise<UndefinedType<Session>> {
    const session = await this.database.query.sessionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
    });

    return session;
  }

  async create(data: Pick<Session, 'userId' | 'hash'>): Promise<Session> {
    const [session] = await this.database
      .insert(schema.sessionsSchema)
      .values({ ...data })
      .returning();

    return session;
  }

  async update(
    id: Session['id'],
    payload: Partial<Pick<Session, 'userId' | 'active' | 'hash'>>,
  ): Promise<Session> {
    const session = await this.database.query.sessionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const [updatedSession] = await this.database
      .update(schema.sessionsSchema)
      .set({
        ...payload,
      })
      .where(eq(schema.sessionsSchema.id, session.id))
      .returning();

    return updatedSession;
  }

  async inactivateById(id: Session['id']): Promise<void> {
    await this.database
      .update(schema.sessionsSchema)
      .set({ active: false })
      .where(eq(schema.sessionsSchema.id, id));
  }

  async inactivateByUserId(conditions: {
    userId: EnterpriseUser['id'];
  }): Promise<void> {
    await this.database
      .update(schema.sessionsSchema)
      .set({ active: false })
      .where(eq(schema.sessionsSchema.userId, conditions.userId));
  }
}
