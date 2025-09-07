import { Module } from '@nestjs/common';

import { EnterpriseUserRepository } from './infrastructure';

@Module({
  providers: [EnterpriseUserRepository],
})
export class EnterpriseUserModule {}
