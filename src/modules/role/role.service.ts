import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { IPaginationOptions } from '@/utils/types';

import { Permission } from '../permission/domain';
import { Role, RoleWithRelations } from './domain/role';
import { RoleRepository } from './infrastructure';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * Find many roles with pagination
   *
   * @async
   * @param paginationOptions {IPaginationOptions}
   *
   * @returns {Promise<RoleWithRelations[]>}
   *
   * @throws {Error}
   */
  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<RoleWithRelations[]> {
    return this.roleRepository.findManyWithPagination({ paginationOptions });
  }

  /**
   * Find role by id
   *
   * @param id {Role['id']}
   *
   * @returns {Promise<RoleWithRelations>}
   *
   * @throws {Error}
   */
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

  /**
   * Create a new role
   *
   * @async
   * @param data {Pick<Role, 'name' | 'slug'>}
   * @param permissionsIds {Permission['id'][]}
   *
   * @returns {Promise<RoleWithRelations>}
   *
   * @throws {Error}
   */
  async create(data: Pick<Role, 'name' | 'slug'>, permissionsIds: Permission['id'][]): Promise<RoleWithRelations> {
    return this.roleRepository.create(data, permissionsIds);
  }
}
