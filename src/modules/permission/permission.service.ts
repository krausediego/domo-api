import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { Permission } from './domain';
import { PermissionRepository } from './infrastructure';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  /**
   * Find many permissions with pagination
   *
   * @async
   * @param paginationOptions {IPaginationOptions}
   *
   * @returns {Promise<Permission[]>}
   *
   * @throws {Error}
   */
  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Permission[]> {
    return this.permissionRepository.findManyWithPagination({
      paginationOptions,
    });
  }

  /**
   * Find permission by id
   *
   * @async
   * @param id {Permission['id']}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
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

  /**
   * Find permission by slug
   *
   * @async
   * @param slug {Permission['slug']}
   *
   * @returns {Promise<UndefinedType<Permission>>}
   *
   * @throws {Error}
   */
  async findBySlug(slug: Permission['slug']): Promise<UndefinedType<Permission>> {
    return this.permissionRepository.findBySlug(slug);
  }

  /**
   * Create a new permission
   *
   * @async
   * @param data {Pick<Permission, 'name' | 'slug'>}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
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

  /**
   * Update permission by id
   *
   * @async
   * @param id {Permission['id']}
   * @param payload {Partial<Permission>}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
  async update(id: Permission['id'], payload: Partial<Permission>): Promise<Permission> {
    return this.permissionRepository.update(id, payload);
  }
}
