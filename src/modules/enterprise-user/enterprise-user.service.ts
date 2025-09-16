import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import { UndefinedType } from '@/utils/types';

import { Enterprise } from '../enterprise/domain';
import { EnterpriseUser, EnterpriseUserWithRelations } from './domain';
import { CreateUserDto } from './dto';
import { EnterpriseUserRepository } from './infrastructure';

@Injectable()
export class EnterpriseUserService {
  constructor(private enterpriseUserRepository: EnterpriseUserRepository) {}

  /**
   * Find user by email
   *
   * @async
   * @param email {EnterpriseUser['email']}
   *
   * @returns {Promise<UndefinedType<EnterpriseUserWithRelations>>}
   *
   * @throws {Error}
   */
  async findUserByEmail(email: EnterpriseUser['email']): Promise<UndefinedType<EnterpriseUserWithRelations>> {
    const user = await this.enterpriseUserRepository.findUserByEmail(email);

    return user;
  }

  /**
   * Find user by id
   *
   * @async
   * @param userId {EnterpriseUser['id']}
   *
   * @returns {Promise<UndefinedType<EnterpriseUserWithRelations>>}
   *
   * @throws {Error}
   */
  async findById(userId: EnterpriseUser['id']): Promise<UndefinedType<EnterpriseUserWithRelations>> {
    const user = await this.enterpriseUserRepository.findUserById(userId);

    return user;
  }

  /**
   * Create a new enterprise user
   *
   * @async
   * @param createUserDto {CreateUserDto}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async create(createUserDto: CreateUserDto, enterpriseId: Enterprise['id']): Promise<void> {
    const salt = await bcrypt.genSalt();

    const password = await bcrypt.hash(createUserDto.password, salt);

    const userAlreadyExists = await this.enterpriseUserRepository.findUserByEmail(createUserDto.email);

    if (userAlreadyExists) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailAlreadyExists',
        },
      });
    }

    const user = await this.enterpriseUserRepository.createUser({
      enterpriseId,
      email: createUserDto.email,
      password,
    });

    await Promise.all(
      createUserDto.roles.map(async (roleId) => {
        await this.enterpriseUserRepository.addUserRoleById(user.id, roleId);
      }),
    );
  }
}
