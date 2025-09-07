import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

import { validateConfig } from '@/utils';

import { MailConfig } from '.';

class EnvironmentVariablesValidator {
  @IsString()
  MAIL_API_KEY: string;
}

export const mailConfig = registerAs<MailConfig>('mail', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiKey: process.env.MAIL_API_KEY,
  };
});
