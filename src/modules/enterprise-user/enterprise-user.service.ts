import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import { IPaginationOptions, UndefinedType } from '@/utils/types';

import { Enterprise } from '../enterprise/domain';
import { EnterpriseUser, EnterpriseUserWithRelations } from './domain';
import { CreateUserWithNewEnterpriseDto } from './dto';
import { EnterpriseUserRepository } from './infrastructure';

@Injectable()
export class EnterpriseUserService {
  constructor(private enterpriseUserRepository: EnterpriseUserRepository) {}

  /**
   * Find many enterprise users with pagination
   *
   * @async
   * @param paginationOptions {IPaginationOptions}
   * @param userId {EnterpriseUser['id']}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<EnterpriseUserWithRelations[]>}
   *
   * @throws {Error}
   */
  async findManyWithPagination({
    paginationOptions,
    userId,
    enterpriseId,
    search,
  }: {
    paginationOptions: IPaginationOptions;
    userId: EnterpriseUser['id'];
    enterpriseId: Enterprise['id'];
    search?: string;
  }): Promise<Omit<EnterpriseUserWithRelations, 'password'>[]> {
    return this.enterpriseUserRepository.findManyWithPagination({ paginationOptions, userId, enterpriseId, search });
  }

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
   * Update enterprise user by userId
   *
   * @async
   * @param userId {EnterpriseUser['id']}
   * @param data {Partial<EnterpriseUser>}
   *
   * @returns {Promise<EnterpriseUser>}
   *
   * @throws {Error}
   */
  async update(userId: EnterpriseUser['id'], data: Partial<EnterpriseUser>): Promise<EnterpriseUser> {
    return this.enterpriseUserRepository.update(userId, data);
  }

  /**
   * Create a new admin enterprise user
   *
   * @async
   * @param createUserDto {CreateUserDto}
   * @param enterpriseId {Enterprise['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async createByNewEnterprise(
    createUserDto: CreateUserWithNewEnterpriseDto,
    enterpriseId: Enterprise['id'],
  ): Promise<void> {
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
