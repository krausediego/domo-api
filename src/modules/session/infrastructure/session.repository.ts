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

  /**
   * Find session by id
   *
   * @async
   * @param id {Session['id']}
   *
   * @returns {Promise<UndefinedType<Session>>}
   *
   * @throws {Error}
   */
  async findById(id: Session['id']): Promise<UndefinedType<Session>> {
    const session = await this.database.query.sessionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
    });

    return session;
  }

  /**
   * Create a new session
   *
   * @async
   * @param data {Pick<Session, 'userId' | 'hash'>}
   *
   * @returns {Promise<Session>}
   *
   * @throws {Error}
   */
  async create(data: Pick<Session, 'userId' | 'hash'>): Promise<Session> {
    const [session] = await this.database
      .insert(schema.sessionsSchema)
      .values({ ...data })
      .returning();

    return session;
  }

  /**
   * Update session by id
   *
   * @async
   * @param id {Session['id']}
   * @param payload {Partial<Session>}
   *
   * @returns {Promise<Session>}
   *
   * @throws {Error}
   */
  async update(id: Session['id'], payload: Partial<Session>): Promise<Session> {
    const session = await this.database.query.sessionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    console.log('session', payload);

    const [updatedSession] = await this.database
      .update(schema.sessionsSchema)
      .set({
        hash: payload.hash,
      })
      .where(eq(schema.sessionsSchema.id, session.id))
      .returning();

    return updatedSession;
  }

  /**
   * Inactivate session by id
   *
   * @async
   * @param id {Session['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async inactivateById(id: Session['id']): Promise<void> {
    await this.database.update(schema.sessionsSchema).set({ active: false }).where(eq(schema.sessionsSchema.id, id));
  }

  /**
   * Inactivate session by user id
   *
   * @async
   * @param conditions {EnterpriseUser['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async inactivateByUserId(conditions: { userId: EnterpriseUser['id'] }): Promise<void> {
    await this.database
      .update(schema.sessionsSchema)
      .set({ active: false })
      .where(eq(schema.sessionsSchema.userId, conditions.userId));
  }
}
