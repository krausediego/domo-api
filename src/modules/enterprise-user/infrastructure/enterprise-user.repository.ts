import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';
import { Role } from '@/modules/role/domain/role';
import { flattenManyToMany } from '@/utils';
import { UndefinedType } from '@/utils/types';

import { EnterpriseUser, EnterpriseUserProfile, EnterpriseUserWithRelations } from '../domain';

const { enterpriseUsersSchema, enterpriseUserProfilesSchema, enterpriseUserRolesSchema } = schema;

@Injectable()
export class EnterpriseUserRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

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
                slug: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'slug');

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
                slug: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'slug');

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
                slug: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'slug');

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
                slug: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const [flattenData] = flattenManyToMany([user], 'enterpriseUserRole', 'role', 'roles', 'slug');

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
}
