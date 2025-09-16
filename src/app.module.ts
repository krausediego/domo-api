import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from '@/config';
import * as schema from '@/database/schemas';
import { mailConfig } from '@/mail';

import { AuthModule } from './modules/auth/auth.module';
import { authConfig } from './modules/auth/config';
import { EnterpriseModule } from './modules/enterprise/enterprise.module';
import { EnterpriseUserModule } from './modules/enterprise-user/enterprise-user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailConfig, authConfig],
      envFilePath: ['.env'],
    }),
    DrizzlePostgresModule.register({
      tag: 'DB',
      postgres: {
        url: process.env.DATABASE_URL!,
      },
      config: {
        schema,
      },
    }),
    AuthModule,
    SessionModule,
    EnterpriseUserModule,
    EnterpriseModule,
    RoleModule,
    PermissionModule,
  ],
})
export class AppModule {}
