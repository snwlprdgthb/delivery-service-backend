import { Injectable, Inject, Global } from '@nestjs/common';
import { MailOptions, EmailVar } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
@Global()
export class MailService {
  constructor(
    @Inject('mailOptions') private readonly mailOptions: MailOptions,
  ) {
    // this.sendEmail('testing', 'test');
  }

  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<Boolean> {
    const form = new FormData();

    form.append(
      'from',
      `Kostya From Pet Project <mailgun@${this.mailOptions.domain}>`,
    );
    form.append('to', 'kostya_poslushnoi@rambler.ru');
    form.append('subject', subject);
    form.append('template', template); // instead this  >  form.append('text', content);
    // form.append('v:code', 'someeecode');
    // form.append('v:username', 'Koka');
    emailVars.forEach((vars) => form.append(`v:${vars.key}`, vars.value));
    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.mailOptions.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.mailOptions.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('verify', '1', [
      { key: 'code', value: code },
      {
        key: 'username',
        value: email,
      },
    ]);
  }
}
