import { MailConfig } from '@/mail/config';

import { AppConfig } from '.';

export type AllConfigType = {
  app: AppConfig;
  mail: MailConfig;
};
