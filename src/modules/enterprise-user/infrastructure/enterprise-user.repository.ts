import { Inject, Injectable } from '@nestjs/common';
import { and, eq, exists } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { Enterprise } from '@/modules/enterprise/domain';
import { Role } from '@/modules/role/domain/role';
import { flattenManyToMany } from '@/utils';
import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { EnterpriseUser, EnterpriseUserProfile, EnterpriseUserWithRelations } from '../domain';

const { enterpriseUsersSchema, enterpriseUserProfilesSchema, enterpriseUserRolesSchema } = schema;

@Injectable()
export class EnterpriseUserRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Find many enterprise users with pagination
   *
   * @async
   * @param paginationOptions {IPaginationOptions}
   * @param userId {EnterpriseUser['id']}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<EnterpriseUserWithRelations[]>}
   *
   * @throws {Error}
   */
  async findManyWithPagination({
    paginationOptions,
    // userId,
    enterpriseId,
    search,
  }: {
    paginationOptions: IPaginationOptions;
    userId: EnterpriseUser['id'];
    enterpriseId: Enterprise['id'];
    search?: string;
  }): Promise<Omit<EnterpriseUserWithRelations, 'password'>[]> {
    const users = await this.database.query.enterpriseUsersSchema.findMany({
      columns: { password: false },
      with: {
        enterpriseUserProfile: true,
        enterpriseUserRole: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      where: (user, { eq, not, and, ilike }) =>
        and(
          eq(user.enterpriseId, enterpriseId),
          not(eq(user.deleted, true)),
          search
            ? exists(
                this.database
                  .select({ id: enterpriseUserProfilesSchema.userId })
                  .from(enterpriseUserProfilesSchema)
                  .where(
                    and(
                      eq(enterpriseUserProfilesSchema.userId, user.id),
                      ilike(enterpriseUserProfilesSchema.name, `%${search.trim()}%`),
                    ),
                  ),
              )
            : undefined,
        ),
      limit: paginationOptions.limit,
      offset: (paginationOptions.page - 1) * paginationOptions.limit,
    });

    const flattenData = flattenManyToMany(users, 'enterpriseUserRole', 'role', 'roles', 'name');

    return flattenData;
  }

  /**
   * Find user by email
   *
   * @async
   * @param email {EnterpriseUser['email']}
   *
   * @returns {Promise<UndefinedType<EnterpriseUserWithRelations>>}
   *
   * @throws {Error}
   */
  async findUserByEmail(email: EnterpriseUser['email']): Promise<UndefinedType<EnterpriseUserWithRelations>> {
    const user = await this.database.query.enterpriseUsersSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email);
      },
      with: {
        enterpriseUserProfile: true,
        enterpriseUserRole: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'name');

      return flattenData;
    }
  }

  /**
   * Find user by id
   *
   * @async
   * @param id {EnterpriseUser['id']}
   *
   * @returns {Promise<UndefinedType<EnterpriseUserWithRelations>>}
   *
   * @throws {Error}
   */
  async findUserById(id: EnterpriseUser['id']): Promise<UndefinedType<EnterpriseUserWithRelations>> {
    const user = await this.database.query.enterpriseUsersSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id);
      },
      with: {
        enterpriseUserProfile: true,
        enterpriseUserRole: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'name');

      return flattenData;
    }
  }

  /**
   * Create a new user
   *
   * @async
   * @param data {Pick<EnterpriseUser, 'enterpriseId' | 'email' | 'password'>}
   *
   * @returns {Promise<EnterpriseUser>}
   *
   * @throws {Error}
   */
  async createUser(data: Pick<EnterpriseUser, 'enterpriseId' | 'email' | 'password'>): Promise<EnterpriseUser> {
    const [user] = await this.database
      .insert(enterpriseUsersSchema)
      .values({ ...data })
      .returning();

    return user;
  }

  /**
   * Add new role in user by role id
   *
   * @async
   * @param userId {EnterpriseUser['id']}
   * @param roleId {Role['id']}
   *
   * @returns {Promise<UndefinedType<EnterpriseUserWithRelations>>}
   *
   * @throws {Error}
   */
  async addUserRoleById(
    userId: EnterpriseUser['id'],
    roleId: Role['id'],
  ): Promise<UndefinedType<EnterpriseUserWithRelations>> {
    await this.database.insert(enterpriseUserRolesSchema).values({ userId, roleId });

    const user = await this.database.query.enterpriseUsersSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId);
      },
      with: {
        enterpriseUserProfile: true,
        enterpriseUserRole: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'name');

      return flattenData;
    }
  }

  /**
   * Remove user role
   *
   * @async
   * @param userId {EnterpriseUser['id']}
   * @param roleId {Role['id']}
   *
   * @returns {Promise<UndefinedType<EnterpriseUserWithRelations>>}
   *
   * @throws {Error}
   */
  async removeUserRole(userId: EnterpriseUser['id'], roleId: Role['id']): Promise<any> {
    await this.database
      .delete(enterpriseUserRolesSchema)
      .where(and(eq(enterpriseUserRolesSchema.userId, userId), eq(enterpriseUserRolesSchema.roleId, roleId)));

    const user = await this.database.query.enterpriseUsersSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId);
      },
      with: {
        enterpriseUserProfile: true,
        enterpriseUserRole: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'name');

      return flattenData;
    }
  }

  /**
   *  Create a new user profile infos
   *
   *  @async
   *  @param data {Omit<EnterpriseUserProfile, 'id' | 'createdAd' | 'UpdatedAt'>}
   *
   *  @returns {Promise<EnterpriseUserProfile>}
   *
   *  @throws {Error}
   */
  async createUserProfile(
    data: Omit<EnterpriseUserProfile, 'id' | 'createdAd' | 'UpdatedAt'>,
  ): Promise<EnterpriseUserProfile> {
    const [userProfile] = await this.database
      .insert(enterpriseUserProfilesSchema)
      .values({ ...data })
      .returning();

    return userProfile;
  }

  /**
   * Update user by userId
   *
   * @async
   * @param userId {EnterpriseUser['id']}
   * @param data {Partial<EnterpriseUser>}
   *
   * @returns {Promise<EnterpriseUser>}
   *
   * @throws {Error}
   */
  async update(userId: EnterpriseUser['id'], data: Partial<EnterpriseUser>): Promise<EnterpriseUser> {
    const enterpriseUser = await this.database.query.enterpriseUsersSchema.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId);
      },
    });

    if (!enterpriseUser) {
      throw new Error('Enterprise user not found');
    }

    const [updatedEnterpriseUser] = await this.database
      .update(schema.enterpriseUsersSchema)
      .set({ ...data })
      .where(eq(schema.enterpriseUsersSchema.id, userId))
      .returning();

    return updatedEnterpriseUser;
  }

  /**
   * Find all users by roleId
   *
   * @async
   * @param roleId {Role['id']}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<Omit<EnterpriseUserWithRelations, 'password'>[]>}
   *
   * @throws {Error}
   */
  async findEnterpriseUsersByRoleId(
    roleId: Role['id'],
    enterpriseId: Enterprise['id'],
  ): Promise<Omit<EnterpriseUserWithRelations, 'password'>[]> {
    const enterpriseUsers = await this.database.query.enterpriseUsersSchema.findMany({
      columns: { password: false },
      where(fields, { eq }) {
        return eq(fields.enterpriseId, enterpriseId);
      },
      with: {
        enterpriseUserRole: {
          columns: {},
          where(fields, { eq }) {
            return eq(fields.roleId, roleId);
          },
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
        enterpriseUserProfile: true,
      },
    });

    const flattenData = flattenManyToMany(enterpriseUsers, 'enterpriseUserRole', 'role', 'roles', 'name');

    return flattenData;
  }
}
