import { ApiProperty } from '@nestjs/swagger';

import { EnterpriseUser } from '@/modules/enterprise-user/domain';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => EnterpriseUser,
  })
  user: Pick<EnterpriseUser, 'id' | 'email' | 'enterpriseId'>;
}
