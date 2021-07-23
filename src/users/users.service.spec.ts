import { Test } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/users.module.entity';
import { Verification } from './entities/verificatio.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { UserResolver } from './users.resolver';

const MockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const MockJWTService = () => ({
  sign: jest.fn(() => 'handle-token'),
  verify: jest.fn(),
});

const MockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: MockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: MockRepository(),
        },
        {
          provide: JwtService,
          useValue: MockJWTService(),
        },
        {
          provide: MailService,
          useValue: MockMailService(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    it('should fail if user exist', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'sadsads',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'email already exist',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exeption', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: 'some error',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'someEmail',
      password: 'somePassword',
    };

    it("should fail if user doesn't exist", async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const res = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(res).toEqual({
        ok: false,
        error: "email doesn't exist in DB",
      });
    });

    it('should fail if password incorrect', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);

      const res = await service.login(loginArgs);
      expect(res).toEqual({
        ok: false,
        error: 'invalid password',
      });
      //   expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      //   expect(usersRepository.findOne).toHaveBeenCalledWith(
      //     expect.any(Object),
      //     expect.any(Object),
      //   );
    });

    it('should get token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const res = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(res).toEqual({ ok: true, token: 'handle-token' });
    });
  });
  //   describe('findById', () => {
  //      it("should return user", async () => {

  //      })
  //   });
  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'some@email',
        emailVerify: true,
      };
      const editArgs = {
        id: 1,
        input: { email: 'some@email' },
      };

      const newVerification = {
        code: 'mockCode',
      };

      const newUser = {
        email: editArgs.input.email,
        emailVerify: false,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editArgs.id, editArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(editArgs.id);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change passsword', async () => {
      const editArgs = {
        id: 1,
        input: { password: 'mocPassword' },
      };

      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      //   usersRepository.save.mockResolvedValue(editArgs);
      const result = await service.editProfile(editArgs.id, editArgs.input);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editArgs.input);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const res = await service.editProfile(1, { email: 'test' });
      expect(res).toEqual({
        ok: false,
        error: "Couldn't update profiles",
      });
    });
  });

  describe('verifyEmail', () => {
    it('should validation success', async () => {
      const verifyArgs: string = 'code';
      const oldVerify = {
        user: { emailVerify: false },
        id: 1,
      };
      const newVerify = {
        user: { emailVerify: true },
      };

      verificationRepository.findOne.mockResolvedValue(oldVerify);

      const res = await service.verifyEmail(verifyArgs);
      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newVerify.user);

      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(oldVerify.id);
      expect(res).toEqual({ ok: true });
    });

    it('should validation error', async () => {
      const verifyArgs: string = 'code';
      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail(verifyArgs);
      expect(result).toEqual({ ok: false, error: 'validation error' });
    });

    it('should fail on exeption', async () => {
      verificationRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('code');
      expect(result).toEqual({ ok: false, error: "Couldn't verify email" });
    });
  });
});
