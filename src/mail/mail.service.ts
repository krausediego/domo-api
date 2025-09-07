import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { AllConfigType } from '@/config';

import { MailData } from '.';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.resend = new Resend(configService.get('mail.apiKey', { infer: true }));
  }

  async sendMail({ to, subject, react }: MailData): Promise<void> {
    await this.resend.emails.send({
      from: 'Domo <naoresponda@domo.com.br>',
      to,
      subject,
      react,
    });
  }
}
