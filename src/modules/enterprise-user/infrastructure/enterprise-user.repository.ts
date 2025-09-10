import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/database/schemas';

import { EnterpriseUser, EnterpriseUserProfile } from '../domain';

@Injectable()
export class EnterpriseUserRepository {
  constructor(
    @Inject('DB')
    private readonly database: PostgresJsDatabase<typeof schema>,
  ) {}

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
      .insert(schema.enterpriseUsersSchema)
      .values({ ...data })
      .returning();

    return user;
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
      .insert(schema.enterpriseUserProfilesSchema)
      .values({ ...data })
      .returning();

    return userProfile;
  }
}
