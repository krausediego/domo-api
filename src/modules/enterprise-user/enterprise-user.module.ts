import { Module } from '@nestjs/common';

import { EnterpriseUserController } from './enterprise-user.controller';
import { EnterpriseUserService } from './enterprise-user.service';
import { EnterpriseUserRepository } from './infrastructure';

@Module({
  controllers: [EnterpriseUserController],
  providers: [EnterpriseUserService, EnterpriseUserRepository],
  exports: [EnterpriseUserService],
})
export class EnterpriseUserModule {}
