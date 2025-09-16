import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { infinityPagination } from '@/utils';
import { InfinityPaginationResponse, InfinityPaginationResponseDto } from '@/utils/dto';

import { Permissions } from '../auth/decorators';
import { Permission } from './domain';
import { CreatePermissionDto, QueryPermissionDto } from './dto';
import { PermissionService } from './permission.service';

@ApiBearerAuth()
@ApiTags('Permissions')
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'permission',
  version: '1',
})
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Get route find all permissions with pagination
   *
   * @async
   * @param query {QueryPermissionDto}
   *
   * @returns {Promise<InfinityPaginationResponseDto<Permission>>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: InfinityPaginationResponse(Permission),
  })
  @Permissions('read_user')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryPermissionDto): Promise<InfinityPaginationResponseDto<Permission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;

    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.permissionService.findManyWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  /**
   * Get route find permission by id
   *
   * @async
   * @param id {Permission['id']}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: Permission,
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: Permission['id']): Promise<Permission> {
    return this.permissionService.findById(id);
  }

  /**
   * Post route create a new permission
   *
   * @async
   * @param body {CreatePermissionDto}
   *
   * @returns {Promise<Permission>}
   *
   * @throws {Error}
   */
  @ApiCreatedResponse({
    type: Permission,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(data);
  }
}
