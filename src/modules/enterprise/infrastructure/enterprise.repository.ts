import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { UndefinedType } from '@/utils/types';

import { Enterprise } from '../domain';

@Injectable()
export class EnterpriseRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Create enterprise
   *
   * @async
   * @param data {Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt'>}
   *
   * @returns {Enterprise}
   *
   * @throws {Error}
   */
  async create(data: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Enterprise> {
    const [enterprise] = await this.database.insert(schema.enterprisesSchema).values(data).returning();

    return enterprise;
  }

  /**
   * Find enterprise by email or cell phone
   *
   * @async
   * @param data {Pick<Enterprise, 'email' | 'cellPhone'>}
   *
   * @returns {Promise<UndefinedType<Enterprise>>}
   *
   * @throws {Error}
   */
  async findByEmailOrCellPhone(data: Pick<Enterprise, 'email' | 'cellPhone'>): Promise<UndefinedType<Enterprise>> {
    const enterprise = await this.database.query.enterprisesSchema.findFirst({
      where(fields, { eq, or }) {
        return or(eq(fields.email, data.email), eq(fields.cellPhone, data.cellPhone));
      },
    });

    return enterprise;
  }
}
