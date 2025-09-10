import { Permission } from '@/modules/permission/domain';

export class Role {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleWithRelations extends Role {
  permissions: Pick<Permission, 'id' | 'slug'>[];
}
