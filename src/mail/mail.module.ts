import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailOptions } from './mail.interface';

@Module({})
@Global()
export class MailModule {
  static forRoot(options: MailOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [MailService, { provide: 'mailOptions', useValue: options }],
      exports: [MailService],
    };
  }
}
