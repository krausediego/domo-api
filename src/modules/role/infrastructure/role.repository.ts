import { Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { Permission } from '@/modules/permission/domain';
import { flattenManyToMany } from '@/utils';
import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { Role, RoleWithRelations } from '../domain/role';

const { rolesSchema, rolePermissionsSchema } = schema;

export class RoleRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Find roles with pagination
   *
   * @async
   * @param paginationOptions {IPaginationOptions}
   *
   * @returns {Promise<RoleWithRelations[]>}
   *
   * @throws {Error}
   */
  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<RoleWithRelations[]> {
    const role = await this.database.query.rolesSchema.findMany({
      where(fields, { eq }) {
        return eq(fields.active, true);
      },
      with: {
        rolePermission: {
          columns: {},
          with: {
            permission: {
              columns: {
                id: true,
                slug: true,
              },
            },
          },
        },
      },
      offset: (paginationOptions.page - 1) * paginationOptions.limit,
      limit: paginationOptions.limit,
    });

    return flattenManyToMany(role, 'rolePermission', 'permission', 'permissions', 'id');
  }

  /**
   * Find role by id
   *
   * @async
   * @param id {Role['id']}
   *
   * @returns {Promise<UndefinedType<RoleWithRelations>>}
   *
   * @throws {Error}
   */
  async findById(id: Role['id']): Promise<UndefinedType<RoleWithRelations>> {
    const role = await this.database.query.rolesSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
      with: {
        rolePermission: {
          columns: {},
          with: {
            permission: {
              columns: {
                id: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (role) {
      const [flattenData] = flattenManyToMany([role], 'rolePermission', 'permission', 'permissions', 'id');

      return flattenData;
    }

    return role;
  }

  /**
   * Find role by slug
   *
   * @async
   * @param slug {Role['slug']}
   *
   * @returns {Promise<UndefinedType<RoleWithRelations>>}
   *
   * @throws {Error}
   */
  async findBySlug(slug: Role['slug']): Promise<UndefinedType<RoleWithRelations>> {
    const role = await this.database.query.rolesSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.slug, slug);
      },
      with: {
        rolePermission: {
          columns: {},
          with: {
            permission: {
              columns: {
                id: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (role) {
      const [flattenData] = flattenManyToMany([role], 'rolePermission', 'permission', 'permissions', 'id');

      return flattenData;
    }
  }

  /**
   * Create a new role
   *
   * @async
   * @param data {Pick<Role, 'name' | 'slug'>}
   * @param permissionsIds {Permission['id'][]}
   *
   * @returns {Promise<RoleWithRelations>}
   *
   * @throws {Error}
   */
  async create(data: Pick<Role, 'name' | 'slug'>, permissionsIds: Permission['id'][]): Promise<RoleWithRelations> {
    const [role] = await this.database
      .insert(rolesSchema)
      .values({ ...data })
      .returning({ id: rolesSchema.id });

    const permissionsInsertData = permissionsIds.map((permissionId) => {
      return {
        roleId: role.id,
        permissionId,
      };
    });

    await this.database.insert(rolePermissionsSchema).values(permissionsInsertData);

    const roleDataReturning = await this.database.query.rolesSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, role.id);
      },
      with: {
        rolePermission: {
          columns: {},
          with: {
            permission: {
              columns: {
                id: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!roleDataReturning) {
      throw new Error('Role not found');
    }

    const [flattenData] = flattenManyToMany([roleDataReturning], 'rolePermission', 'permission', 'permissions', 'id');

    return flattenData;
  }

  /**
   * Update a permission by id
   *
   * @async
   * @param id {Role['id']}
   * @param payload {Partial<Role>}
   *
   * @returns {Promise<Role>}
   *
   * @throws {Error}
   */
  async update(id: Role['id'], payload: Partial<Role>): Promise<Role> {
    const [role] = await this.database
      .update(rolesSchema)
      .set({ ...payload })
      .where(eq(rolesSchema.id, id))
      .returning();

    return role;
  }

  /**
   * Add new permission in exists role
   *
   * @async
   * @param roleId {Role['id']}
   * @param permissionId {Permission['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async addPermission(roleId: Role['id'], permissionId: Permission['id']): Promise<void> {
    await this.database.insert(rolePermissionsSchema).values({ roleId, permissionId });
  }

  /**
   * Remove permission in exists role
   *
   * @async
   * @param roleId {Role['id']}
   * @param permissionId {Permission['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async removePermission(roleId: Role['id'], permissionId: Permission['id']): Promise<void> {
    await this.database
      .delete(rolePermissionsSchema)
      .where(and(eq(rolePermissionsSchema.roleId, roleId), eq(rolePermissionsSchema.permissionId, permissionId)));
  }
}
