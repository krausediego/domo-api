export class EnterpriseUser {
  id: string;
  enterpriseId: string;
  email: string;
  password: string;
  blocked: boolean;
  tempPassword: boolean;
  emailConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EnterpriseUserProfile {
  id: string;
  userId: string;
  name: string;
  cellPhone: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
