import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { infinityPagination } from '@/utils';
import { InfinityPaginationResponse, InfinityPaginationResponseDto } from '@/utils/dto';

import { CurrentEnterpriseId, CurrentUserId, Permissions } from '../auth/decorators';
import { QueryPermissionDto } from '../permission/dto';
import { EnterpriseUserWithRelations } from './domain';
import { EnterpriseUserService } from './enterprise-user.service';

@ApiBearerAuth()
@ApiTags('Enterprise Users')
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'enterprise_users',
  version: '1',
})
export class EnterpriseUserController {
  constructor(private readonly enterpriseUserService: EnterpriseUserService) {}

  @ApiOkResponse({
    type: InfinityPaginationResponse(EnterpriseUserWithRelations),
  })
  @Permissions('READ_USERS')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryPermissionDto,
    @CurrentUserId() userId: string,
    @CurrentEnterpriseId() enterpriseId: string,
  ): Promise<InfinityPaginationResponseDto<Omit<EnterpriseUserWithRelations, 'password'>>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;

    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.enterpriseUserService.findManyWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        userId,
        enterpriseId,
        search: query?.search,
      }),
      { page, limit },
    );
  }
}
