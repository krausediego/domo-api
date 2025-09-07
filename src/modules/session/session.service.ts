import { Injectable } from '@nestjs/common';

import { UndefinedType } from '@/utils/types';

import { EnterpriseUser } from '../enterprise-user/domain';
import { Session } from './domain';
import { SessionRepository } from './infrastructure';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  findById(id: Session['id']): Promise<UndefinedType<Session>> {
    return this.sessionRepository.findById(id);
  }

  create(data: Pick<Session, 'userId' | 'hash'>): Promise<Session> {
    return this.sessionRepository.create(data);
  }

  update(
    id: Session['id'],
    payload: Partial<Pick<Session, 'userId' | 'active' | 'hash'>>,
  ): Promise<UndefinedType<Session>> {
    return this.sessionRepository.update(id, payload);
  }

  async inactivateById(id: Session['id']): Promise<void> {
    await this.sessionRepository.inactivateById(id);
  }

  async inactivateByUserId(conditions: {
    userId: EnterpriseUser['id'];
  }): Promise<void> {
    await this.sessionRepository.inactivateByUserId(conditions);
  }
}
