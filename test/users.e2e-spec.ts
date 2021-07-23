import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/users.module.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { async } from 'rxjs';
import { Verification } from 'src/users/entities/verificatio.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const FAKE_USER = {
  email: 'fakeuser@email',
  password: 'fakepassword',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let token: string;

  const BaseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);

  const PublicTest = (query: string) => BaseTest().send({ query });

  const PrivateTest = (query: string) =>
    BaseTest().set({ 'x-jwt': token }).send(GRAPHQL_ENDPOINT);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          createAccount(input:{
            email: "${FAKE_USER.email}",
            password:"${FAKE_USER.password}",
            role: Client
          }) {
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
           mutation {
             createAccount(input:{
              email: "${FAKE_USER.email}",
            password:"${FAKE_USER.password}",
               role: Client
             }) {
               ok
               error
             }
           }
           `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe('email already exist');
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(input: {
            email: "${FAKE_USER.email}",
            password:"${FAKE_USER.password}",
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          token = login.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(input: {
            email: "${FAKE_USER.email}",
            password:"666",
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('invalid password');
          expect(login.token).toBe(null);
        });
    });
  });

  describe('userProfle', () => {
    let userID;
    beforeAll(async () => {
      const [user] = await userRepository.find();
      userID = user.id;
    });

    it('should see a user profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', token)
        .send({
          query: `
        {
          userProfile(userId: ${userID}) {
            error
            ok
            user {id}
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(id).toBe(userID);
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ 'x-jwt': token })
        .send({
          query: `
          {
            userProfile(userId: 99999999) {
              error
              ok
              user {id}
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('USER NOT FounD');
          expect(user).toEqual(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ 'x-jwt': token })
        .send({
          query: `{
            me {
              email
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(FAKE_USER.email);
        });
    });

    it("shouldn't find profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        {
          me {
            email
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'newTest@email.com';
    it('should change email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ 'x-jwt': token })
        .send({
          query: `
          mutation {
            editProfile(input:{email: "${NEW_EMAIL}"}) {
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ 'x-jwt': token })
        .send({
          query: `
        {
          me {
            email
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let codeTest;

    beforeAll(async () => {
      let [verif] = await verificationRepository.find();
      codeTest = verif.code;
    });

    it('should verify email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          getVerify(input: {code: "${codeTest}"}) {
            ok, error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getVerify: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it("shouldn't verify", () => {
      const exactlyQuery = `
      mutation {
        getVerify(input: {code: "wrongCode"}) {
          ok, error
        }
      }
      `;

      PublicTest(exactlyQuery)
        .expect(200)
        .expect((res) => {
          console.log(BaseTest());
          const {
            body: {
              data: {
                getVerify: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('validation error');
        });
    });
  });
});
