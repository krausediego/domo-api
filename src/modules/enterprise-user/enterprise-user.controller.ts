import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { infinityPagination } from '@/utils';
import { InfinityPaginationResponse, InfinityPaginationResponseDto } from '@/utils/dto';

import { CurrentEnterpriseId, CurrentUserId, Permissions } from '../auth/decorators';
import { Enterprise } from '../enterprise/domain';
import { QueryPermissionDto } from '../permission/dto';
import { Role } from '../role/domain/role';
import { EnterpriseUser, EnterpriseUserWithRelations } from './domain';
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

  /**
   * Get paginated enterprise users
   *
   * @async
   * @param query {QueryPermissionDto}
   * @param userId {EnterpriseUser['id']}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<InfinityPaginationResponseDto<Omit<EnterpriseUserWithRelations, 'password'>>>}
   *
   * @throws {Error}
   */
  @ApiOkResponse({
    type: InfinityPaginationResponse(EnterpriseUserWithRelations),
  })
  @Permissions('READ_USERS')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryPermissionDto,
    @CurrentUserId() userId: EnterpriseUser['id'],
    @CurrentEnterpriseId() enterpriseId: Enterprise['id'],
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

  @ApiOkResponse({
    type: EnterpriseUserWithRelations,
  })
  @Permissions('READ_USERS')
  @Get(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'roleId',
    type: String,
    required: true,
  })
  async findEnterpriseUsersWithRoleId(
    @Param('roleId') roleId: Role['id'],
    @CurrentEnterpriseId() enterpriseId: Enterprise['id'],
  ): Promise<Omit<EnterpriseUserWithRelations, 'password'>[]> {
    return this.enterpriseUserService.findEnterpriseUsersByRoleId(roleId, enterpriseId);
  }
}
