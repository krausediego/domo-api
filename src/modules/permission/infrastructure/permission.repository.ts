import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { Permission } from '../domain';

@Injectable()
export class PermissionRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Permission[]> {
    const permissions = await this.database.query.permissionsSchema.findMany({
      offset: (paginationOptions.page - 1) * paginationOptions.limit,
      limit: paginationOptions.limit,
    });

    return permissions;
  }

  async findByName(
    name: Permission['name'],
  ): Promise<UndefinedType<Permission>> {
    return this.database.query.permissionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.name, name);
      },
    });
  }

  async create(data: Pick<Permission, 'name' | 'slug'>): Promise<Permission> {
    const [permission] = await this.database
      .insert(schema.permissionsSchema)
      .values({ ...data })
      .returning();

    return permission;
  }

  async update(
    id: Permission['id'],
    payload: Pick<Permission, 'name' | 'slug'>,
  ): Promise<Permission> {
    const permission = await this.database.query.permissionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    const [updatedPermission] = await this.database
      .update(schema.permissionsSchema)
      .set({ ...payload })
      .where(eq(schema.permissionsSchema.id, id))
      .returning();

    return updatedPermission;
  }
}
