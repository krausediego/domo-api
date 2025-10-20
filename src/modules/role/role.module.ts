import { Module } from '@nestjs/common';

import { PermissionModule } from '../permission/permission.module';
import { RoleRepository } from './infrastructure';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [PermissionModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService],
})
export class RoleModule {}
