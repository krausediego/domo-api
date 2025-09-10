import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { infinityPagination } from '@/utils';
import { InfinityPaginationResponse, InfinityPaginationResponseDto } from '@/utils/dto';

import { Role, RoleWithRelations } from './domain/role';
import { CreateRoleDto, QueryRoleDto } from './dto';
import { RoleService } from './role.service';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller({
  path: 'role',
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
  async findAll(@Query() query: QueryRoleDto): Promise<InfinityPaginationResponseDto<RoleWithRelations>> {
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
  async create(@Body() { name, slug, permissionsIds }: CreateRoleDto): Promise<RoleWithRelations> {
    return this.roleService.create({ name, slug }, permissionsIds);
  }
}
