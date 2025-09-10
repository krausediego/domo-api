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

  async createUser(data: EnterpriseUser): Promise<EnterpriseUser> {
    const [user] = await this.database
      .insert(schema.enterpriseUsersSchema)
      .values({ ...data })
      .returning();

    return user;
  }

  async createUserProfile(
    data: EnterpriseUserProfile,
  ): Promise<EnterpriseUserProfile> {
    const [userProfile] = await this.database
      .insert(schema.enterpriseUserProfilesSchema)
      .values({ ...data })
      .returning();

    return userProfile;
  }
}
