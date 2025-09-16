import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { EnterpriseUserService } from '../enterprise-user/enterprise-user.service';
import { RoleService } from '../role/role.service';
import { CreateEnterpriseDto } from './dto';
import { EnterpriseRepository } from './infrastructure';

@Injectable()
export class EnterpriseService {
  constructor(
    private readonly enterpriseUserService: EnterpriseUserService,
    private readonly roleService: RoleService,
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

    const adminRole = await this.roleService.findBySlug('ADMIN');

    if (!adminRole) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'adminRoleNotFound',
        },
      });
    }

    // TODO: Implements upload logo and get url.
    const enterprise = await this.enterpriseRepository.create({ name, email, cellPhone, description, logoUrl: 'ab' });

    await this.enterpriseUserService.create(
      {
        email,
        password: user.password,
        roles: [adminRole.id],
      },
      enterprise.id,
    );
  }
}
