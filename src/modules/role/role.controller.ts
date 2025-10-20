import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { infinityPagination } from '@/utils';
import { InfinityPaginationResponse, InfinityPaginationResponseDto } from '@/utils/dto';

import { CurrentEnterpriseId } from '../auth/decorators';
import { Enterprise } from '../enterprise/domain';
import { Role, RoleWithRelations } from './domain/role';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from './dto';
import { RoleService } from './role.service';

@ApiBearerAuth()
@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'roles',
  version: '1',
})
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Get route find all roles with pagination
   *
   * @async
   * @param query {QueryRoleDto}
   *
   * @returns {Promise<InfinityPaginationResponseDto<RoleWithRelations>>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: InfinityPaginationResponse(RoleWithRelations),
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryRoleDto,
    @CurrentEnterpriseId() enterpriseId: string,
  ): Promise<InfinityPaginationResponseDto<RoleWithRelations>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;

    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.roleService.findManyWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        enterpriseId,
      }),
      { page, limit },
    );
  }

  /**
   * Get route find role by id
   *
   * @async
   * @param id {Role['id']}
   *
   * @returns {Promise<RoleWithRelations>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: RoleWithRelations,
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: Role['id']): Promise<RoleWithRelations> {
    return this.roleService.findById(id);
  }

  /**
   * Post route create new role
   *
   * @async
   * @param body {CreateRoleDto}
   *
   * @returns {Promise<RoleWithRelations>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: RoleWithRelations,
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() data: CreateRoleDto, @CurrentEnterpriseId() enterpriseId: string): Promise<RoleWithRelations> {
    return this.roleService.create({ ...data, enterpriseId });
  }

  /**
   * Update a Role
   *
   * @async
   *
   * @param data {UpdateRoleDto}
   * @param roleId {Role['id']}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<Role>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: Role,
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  update(
    @Body() data: UpdateRoleDto,
    @Param('id') roleId: Role['id'],
    @CurrentEnterpriseId() enterpriseId: Enterprise['id'],
  ): Promise<RoleWithRelations[]> {
    return this.roleService.update(data, roleId, enterpriseId);
  }
}
