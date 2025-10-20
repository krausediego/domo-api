import { Inject } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { Enterprise } from '@/modules/enterprise/domain';
import { Permission } from '@/modules/permission/domain';
import { flattenManyToMany } from '@/utils';
import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { Role, RoleWithRelations } from '../domain/role';
import { CreateRoleDto, UpdateRoleDto } from '../dto';

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
    enterpriseId,
  }: {
    paginationOptions: IPaginationOptions;
    enterpriseId: string;
  }): Promise<RoleWithRelations[]> {
    const role = await this.database.query.rolesSchema.findMany({
      where(fields, { eq, and }) {
        return and(eq(fields.status, true), eq(fields.enterpriseId, enterpriseId));
      },
      with: {
        rolePermission: {
          columns: {},
          with: {
            permission: {
              columns: {
                id: true,
                slug: true,
                name: true,
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
  async create(data: CreateRoleDto): Promise<RoleWithRelations> {
    const [role] = await this.database
      .insert(rolesSchema)
      .values({ ...data })
      .returning({ id: rolesSchema.id });

    const permissionsInsertData = data.permissionsIds.map((permissionId) => {
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
  async update(
    payload: UpdateRoleDto,
    roleId: Role['id'],
    enterpriseId: Enterprise['id'],
  ): Promise<RoleWithRelations[]> {
    return await this.database.transaction(async (tx) => {
      await tx
        .update(rolesSchema)
        .set({ ...payload })
        .where(and(eq(rolesSchema.id, roleId), eq(rolesSchema.enterpriseId, enterpriseId)));

      const currentRows = await tx
        .select({ permissionId: rolePermissionsSchema.permissionId })
        .from(rolePermissionsSchema)
        .where(eq(rolePermissionsSchema.roleId, roleId));

      const current = new Set(currentRows.map((row) => row.permissionId));
      const desiredSet = new Set(payload.permissionsIds);

      const toAdd = [...desiredSet].filter((id) => !current.has(id));
      const toRemove = [...current].filter((id) => !desiredSet.has(id));

      if (toAdd.length > 0) {
        await tx
          .insert(rolePermissionsSchema)
          .values(toAdd.map((pid) => ({ roleId, permissionId: pid })))
          .onConflictDoNothing();
      }

      if (toRemove.length > 0) {
        await tx
          .delete(rolePermissionsSchema)
          .where(and(eq(rolePermissionsSchema.roleId, roleId), inArray(rolePermissionsSchema.permissionId, toRemove)));
      }

      const final = await tx.query.rolesSchema.findMany({
        where(fields, { eq }) {
          return eq(fields.id, roleId);
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

      return flattenManyToMany(final, 'rolePermission', 'permission', 'permissions', 'id');
    });
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
