import { Enterprise } from '@/modules/enterprise/domain';
import { EnterpriseUser } from '@/modules/enterprise-user/domain';
import { Permission } from '@/modules/permission/domain';
import { Role } from '@/modules/role/domain/role';
import { Session } from '@/modules/session/domain';

export type JwtPayloadType = {
  sub: EnterpriseUser['id'];
  enterpriseId: Enterprise['id'];
  sessionId: Session['id'];
  roles: Pick<Role, 'id' | 'slug'>[];
  permissions: Permission['slug'][];
  iat: number;
  exp: number;
};
