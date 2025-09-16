import { MailConfig } from '@/mail/config';
import { AuthConfig } from '@/modules/auth/config';

import { AppConfig } from '.';

export type AllConfigType = {
  app: AppConfig;
  mail: MailConfig;
  auth: AuthConfig;
};
