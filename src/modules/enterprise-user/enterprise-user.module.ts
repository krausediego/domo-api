import { Module } from '@nestjs/common';

import { EnterpriseUserService } from './enterprise-user.service';
import { EnterpriseUserRepository } from './infrastructure';

@Module({
  providers: [EnterpriseUserService, EnterpriseUserRepository],
  exports: [EnterpriseUserService],
})
export class EnterpriseUserModule {}
