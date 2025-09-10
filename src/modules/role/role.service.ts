import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { IPaginationOptions } from '@/utils/types';

import { Permission } from '../permission/domain';
import { Role, RoleWithRelations } from './domain/role';
import { RoleRepository } from './infrastructure';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<RoleWithRelations[]> {
    return this.roleRepository.findManyWithPagination({ paginationOptions });
  }

  async findById(id: Role['id']): Promise<RoleWithRelations> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          permission: 'roleNotExists',
        },
      });
    }

    return role;
  }

  async create(
    name: Role['name'],
    permissionsIds: Permission['id'][],
  ): Promise<RoleWithRelations> {
    return this.roleRepository.create(name, permissionsIds);
  }
}
