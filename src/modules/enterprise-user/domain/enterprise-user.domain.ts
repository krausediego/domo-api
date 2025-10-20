import { Role } from '@/modules/role/domain/role';

import { EnterpriseUserProfile } from '.';

export class EnterpriseUser {
  id: string;
  enterpriseId: string;
  email: string;
  password: string;
  blocked: boolean;
  tempPassword: boolean;
  emailConfirmed: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EnterpriseUserWithRelations extends EnterpriseUser {
  enterpriseUserProfile: EnterpriseUserProfile | null;
  roles: Pick<Role, 'id' | 'name'>[];
}
