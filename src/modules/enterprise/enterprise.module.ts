import { Module } from '@nestjs/common';

import { EnterpriseUserModule } from '../enterprise-user/enterprise-user.module';
import { RoleModule } from '../role/role.module';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseRepository } from './infrastructure';

@Module({
  imports: [EnterpriseUserModule, RoleModule],
  controllers: [EnterpriseController],
  providers: [EnterpriseService, EnterpriseRepository],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
