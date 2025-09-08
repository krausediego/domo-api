import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { infinityPagination } from '@/utils';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@/utils/dto';

import { Permission } from './domain';
import { CreatePermissionDto, QueryPermissionDto } from './dto';
import { PermissionService } from './permission.service';

@ApiBearerAuth()
@ApiTags('Permissions')
@Controller({
  path: 'permission',
  version: '1',
})
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiCreatedResponse({
    type: Permission,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(data);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(Permission),
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryPermissionDto,
  ): Promise<InfinityPaginationResponseDto<Permission>> {
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
}
