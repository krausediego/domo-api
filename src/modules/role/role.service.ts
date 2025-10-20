import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { IPaginationOptions } from '@/utils/types';

import { Enterprise } from '../enterprise/domain';
import { PermissionService } from '../permission/permission.service';
import { Role, RoleWithRelations } from './domain/role';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { RoleRepository } from './infrastructure';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionService: PermissionService,
  ) {}

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
    enterpriseId,
  }: {
    paginationOptions: IPaginationOptions;
    enterpriseId: Enterprise['id'];
  }): Promise<RoleWithRelations[]> {
    return this.roleRepository.findManyWithPagination({ paginationOptions, enterpriseId });
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
   * @param data {Pick<Role, 'name' | 'enterpriseId'>}
   * @param permissionsIds {Permission['id'][]}
   *
   * @returns {Promise<RoleWithRelations>}
   *
   * @throws {Error}
   */
  async create(data: CreateRoleDto): Promise<RoleWithRelations> {
    return this.roleRepository.create(data);
  }

  /**
   * Update a role
   *
   * @async
   * @param data {UpdateRoleDto}
   * @param roleId {Role['id']}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<Role>}
   *
   * @throws {Error}
   */
  async update(data: UpdateRoleDto, roleId: Role['id'], enterpriseId: Enterprise['id']): Promise<RoleWithRelations[]> {
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          permission: 'roleNotExists',
        },
      });
    }

    const permissions = Array.from(new Set(data.permissionsIds ?? []));

    if (permissions.length) {
      const permissionsFinded = await this.permissionService.findByArrayIds(permissions);

      if (permissionsFinded.length !== permissions.length) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            permission: 'oneOrMorePermissionsNotFound',
          },
        });
      }
    }

    return this.roleRepository.update(data, roleId, enterpriseId);
  }
}
