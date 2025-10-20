import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { EnterpriseUserService } from '../enterprise-user/enterprise-user.service';
import { PermissionService } from '../permission/permission.service';
import { RoleService } from '../role/role.service';
import { CreateEnterpriseDto } from './dto';
import { EnterpriseRepository } from './infrastructure';

@Injectable()
export class EnterpriseService {
  constructor(
    private readonly enterpriseUserService: EnterpriseUserService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly enterpriseRepository: EnterpriseRepository,
  ) {}

  /**
   * Create new enterprise
   *
   * @async
   * @param data {CreateEnterpriseDto}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async create(data: CreateEnterpriseDto): Promise<void> {
    const { name, description, email, cellPhone, user } = data;

    const enterpriseAlreadyExists = await this.enterpriseRepository.findByEmailOrCellPhone({ email, cellPhone });

    if (enterpriseAlreadyExists) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'enterpriseEmailOrCellPhoneAlreadyExists',
        },
      });
    }

    const userAlreadyExists = await this.enterpriseUserService.findUserByEmail(user.email);

    if (userAlreadyExists) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'userAlreadyExists',
        },
      });
    }

    const permissions = await this.permissionService.findManyWithPagination({
      paginationOptions: { page: 1, limit: 999 },
    });

    // TODO: Implements upload logo and get url.
    const enterprise = await this.enterpriseRepository.create({ name, email, cellPhone, description, logoUrl: 'ab' });

    const role = await this.roleService.create({
      name: 'Admin',
      enterpriseId: enterprise.id,
      permissionsIds: permissions.map((permission) => permission.id),
      editable: false,
    });

    await this.enterpriseUserService.createByNewEnterprise(
      {
        email,
        password: user.password,
        roles: [role.id],
      },
      enterprise.id,
    );
  }
}
