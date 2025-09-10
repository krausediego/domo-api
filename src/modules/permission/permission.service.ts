import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { IPaginationOptions, UndefinedType } from '@/utils/types';

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

  async findById(id: Permission['id']): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          permission: 'permissionNotExists',
        },
      });
    }

    return permission;
  }

  async findBySlug(
    slug: Permission['slug'],
  ): Promise<UndefinedType<Permission>> {
    return this.permissionRepository.findBySlug(slug);
  }

  async create(data: Pick<Permission, 'name' | 'slug'>): Promise<Permission> {
    const permission = await this.permissionRepository.findBySlug(data.slug);

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
