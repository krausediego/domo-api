import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from '@/config';
import * as schema from '@/database/schemas';
import { mailConfig } from '@/mail';

import { EnterpriseUserModule } from './modules/enterprise-user/enterprise-user.module';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailConfig],
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
    SessionModule,
    EnterpriseUserModule,
  ],
})
export class AppModule {}
