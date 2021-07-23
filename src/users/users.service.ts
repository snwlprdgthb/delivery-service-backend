import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.module.entity';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { UsersModule } from './users.module';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verificatio.entity';
import { ThisExpression } from 'ts-morph';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import { verifier } from '@apollo/protobufjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,

    private readonly JwtService: JwtService,
    private readonly MailService: MailService,
  ) {
    // console.log(config.get('SECRET_KEY'));
  }

  async createAccount({
    password,
    email,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const isExist = await this.users.findOne({ email });

      if (isExist) {
        return {
          ok: false,
          error: 'email already exist',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verify = await this.verifications.save(
        this.verifications.create({ user }),
      );
      await this.MailService.sendVerificationEmail(user.email, verify.code);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'some error',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    //check email,  done
    // check password
    //jwt
    try {
      const user = await this.users.findOne(
        { email },
        {
          select: ['password', 'id'],
        },
      );
      if (!user) {
        return {
          ok: false,
          error: "email doesn't exist in DB",
        };
      }

      const isValidPassword = await user.checkPassword(password);
      if (!isValidPassword) {
        return {
          ok: false,
          error: 'invalid password',
        };
      }
      // const token = JwtService.sign();
      const token = this.JwtService.sign({ id: user.id });

      return {
        ok: true,
        token,
      };
    } catch (e) {
      console.log(e);
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.users.findOne({ id });
    return user;
  }

  async editProfile(
    id: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(id);

      if (email) {
        const oldVerifyEntity = await this.verifications.findOne({ user });
        await this.verifications.delete(oldVerifyEntity.id);

        user.email = email;
        user.emailVerify = false;

        console.log('11111');
        // console.log(user);

        const verify = await this.verifications.save(
          this.verifications.create({ user }),
        );

        await this.MailService.sendVerificationEmail(user.email, verify.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: "Couldn't update profiles",
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );

      if (verification) {
        verification.user.emailVerify = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }

      return {
        ok: false,
        error: 'validation error',
      };
    } catch (error) {
      return {
        ok: false,
        error: "Couldn't verify email",
      };
    }
  }
}
