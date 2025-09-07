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
