import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { Role } from '@/modules/role/domain/role';
import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { Permission } from '../domain';

@Injectable()
export class PermissionRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Find many permissions with pagination
   *
   * @async
   * @param paginationOptions {IPaginationOptions}
   *
   * @returns {Promise<Permission[]>}
   *
   * @throws {Error}
   */
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

  /**
   * Find permission by id
   *
   * @async
   * @param id {Permission['id']}
   *
   * @returns {Promise<UndefinedType<Permission>>}
   *
   * @throws {Error}
   */
  async findById(id: Permission['id']): Promise<UndefinedType<Permission>> {
    const permission = await this.database.query.permissionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
    });

    return permission;
  }

  /**
   * Find permission by slug
   *
   * @async
   * @param slug {Permission['slug']}
   *
   * @returns {Promise<UndefinedType<Permission>>}
   *
   * @throws {Error}
   */
  async findBySlug(slug: Permission['slug']): Promise<UndefinedType<Permission>> {
    return this.database.query.permissionsSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.slug, slug);
      },
    });
  }

  /**
   * Find permissions slugs by role id
   *
   * @async
   * @param roleId {Role['id']}
   *
   * @returns {Promise<Permission['slug'][]}
   *
   * @throws {Error}
   *
   */
  async findSlugByRoleId(roleId: Role['id']): Promise<Permission['slug'][]> {
    const permissions = await this.database
      .select({
        slug: schema.permissionsSchema.slug,
      })
      .from(schema.permissionsSchema)
      .leftJoin(
        schema.rolePermissionsSchema,
        eq(schema.permissionsSchema.id, schema.rolePermissionsSchema.permissionId),
      )
      .where(eq(schema.rolePermissionsSchema.roleId, roleId))
      .then((rows) => rows.map((row) => row.slug));

    return permissions;
  }

  /**
   * Create new permission
   *
   * @async
   * @param data {Pick<Permission, 'name' | 'slug'>}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
  async create(data: Pick<Permission, 'name' | 'slug'>): Promise<Permission> {
    const [permission] = await this.database
      .insert(schema.permissionsSchema)
      .values({ ...data })
      .returning();

    return permission;
  }

  /**
   * Update permission by id
   *
   * @async
   * @param id {Permission['id']}
   * @param payload {Partial<Permission>}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
  async update(id: Permission['id'], payload: Partial<Permission>): Promise<Permission> {
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

  /**
   * Exists permissions by array of ids
   *
   * @async
   *
   * @param ids {Permission['id'][]}
   *
   * @returns {Promise<{ id: Permission['id'] }[]>}
   *
   * @throws {Error}
   */
  async findByArrayIds(ids: Permission['id'][]): Promise<{ id: Permission['id'] }[]> {
    return this.database
      .select({ id: schema.permissionsSchema.id })
      .from(schema.permissionsSchema)
      .where(inArray(schema.permissionsSchema.id, ids));
  }
}
