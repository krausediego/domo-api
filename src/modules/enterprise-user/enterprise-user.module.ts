import { Module } from '@nestjs/common';

import { RoleModule } from '../role/role.module';
import { EnterpriseUserController } from './enterprise-user.controller';
import { EnterpriseUserService } from './enterprise-user.service';
import { EnterpriseUserRepository } from './infrastructure';

@Module({
  imports: [RoleModule],
  controllers: [EnterpriseUserController],
  providers: [EnterpriseUserService, EnterpriseUserRepository],
  exports: [EnterpriseUserService],
})
export class EnterpriseUserModule {}
