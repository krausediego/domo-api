import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { IPaginationOptions } from '@/utils/types';

import { Permission } from './domain';
import { PermissionRepository } from './infrastructure';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Permission[]> {
    return this.permissionRepository.findManyWithPagination({
      paginationOptions,
    });
  }

  async create(data: Pick<Permission, 'name' | 'slug'>): Promise<Permission> {
    const permission = await this.permissionRepository.findByName(data.name);

    if (permission) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: 'nameExists',
        },
      });
    }

    return this.permissionRepository.create(data);
  }

  async update(
    id: Permission['id'],
    payload: Pick<Permission, 'name' | 'slug'>,
  ): Promise<Permission> {
    return this.permissionRepository.update(id, payload);
  }
}
