import { Enterprise } from '@/modules/enterprise/domain';
import { Permission } from '@/modules/permission/domain';

export class Role {
  id: string;
  enterpriseId: Enterprise['id'];
  name: string;
  status: boolean;
  editable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleWithRelations extends Role {
  permissions: Pick<Permission, 'id' | 'slug'>[];
}
