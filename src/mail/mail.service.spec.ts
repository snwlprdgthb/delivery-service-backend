import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import got from 'got';
import * as FormData from 'form-data';

const testOptions = {
  apiKey: 'apiKey',
  domain: 'domain',
  fromEmail: 'fromEmail',
};

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: 'mailOptions',
          useValue: testOptions,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send  args to SendEmail f', () => {
      const sendVerArgs = {
        email: 'email',
        code: 'code',
      };
      //   service.sendEmail = jest.fn();  we do spy instead mock
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(sendVerArgs.email, sendVerArgs.code);
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith('verify', '1', [
        { key: 'code', value: sendVerArgs.code },
        {
          key: 'username',
          value: sendVerArgs.email,
        },
      ]);
    });
  });

  describe('sendEmail', () => {
    it('send email', async () => {
      const ok = await service.sendEmail('', '', [
        { key: 'key', value: 'value' },
      ]);
      const FormAppendSpy = jest.spyOn(FormData.prototype, 'append');
      expect(FormAppendSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${testOptions.domain}/messages`,
        expect.any(Object),
      );
      expect(ok).toEqual(true);
    });
    it('should fail on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const fail = await service.sendEmail('', '', []);

      expect(fail).toEqual(false);
    });
  });
});
