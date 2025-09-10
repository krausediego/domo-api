import { Injectable } from '@nestjs/common';

import { UndefinedType } from '@/utils/types';

import { EnterpriseUser } from '../enterprise-user/domain';
import { Session } from './domain';
import { SessionRepository } from './infrastructure';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  /**
   * Find session by id
   *
   * @async
   * @param id {Session['id']}
   *
   * @returns {Promise<UndefinedType<Session>>}
   *
   * @throws {Error}
   */
  findById(id: Session['id']): Promise<UndefinedType<Session>> {
    return this.sessionRepository.findById(id);
  }

  /**
   * Create a new session
   *
   * @async
   * @param data {Pick<Session, 'userId' | 'hash'>}
   *
   * @returns {Promise<Session>}
   *
   * @throws {Error}
   */
  create(data: Pick<Session, 'userId' | 'hash'>): Promise<Session> {
    return this.sessionRepository.create(data);
  }

  /**
   * Update session by id
   *
   * @async
   * @param id {Session['id']}
   * @param payload {Partial<Session>}
   *
   * @returns {Promise<UndefinedType<Session>>}
   *
   * @throws {Error}
   */
  update(id: Session['id'], payload: Partial<Session>): Promise<UndefinedType<Session>> {
    return this.sessionRepository.update(id, payload);
  }

  /**
   * Inactivate session by id
   *
   * @async
   * @param id {Session['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async inactivateById(id: Session['id']): Promise<void> {
    await this.sessionRepository.inactivateById(id);
  }

  /**
   * Inactivate session by user id
   *
   * @async
   * @param conditions {EnterpriseUser['id']}
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   */
  async inactivateByUserId(conditions: { userId: EnterpriseUser['id'] }): Promise<void> {
    await this.sessionRepository.inactivateByUserId(conditions);
  }
}
