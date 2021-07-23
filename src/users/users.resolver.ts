import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from './entities/users.module.entity';
import { UserService } from './users.service';
import {
  CreateAccountOutput,
  CreateAccountInput,
} from './dtos/create-account.dto';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { userInfo } from 'os';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { VerifyEmailOutput, VerifyEmailInput } from './dtos/verify-email.dto';
import { roleDec } from 'src/auth/role-decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly UserService: UserService) {}

  // @Query(() => Boolean)
  // hi() {
  //   return true;
  // }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') CreateAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const error = await this.UserService.createAccount(CreateAccountInput);

      if (error.error === 'email already exist') {
        return {
          ok: false,
          error: 'email already exist',
        };
      }
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') LoginInput: LoginInput): Promise<LoginOutput> {
    try {
      const some = this.UserService.login(LoginInput);
      return some;
    } catch (error) {
      return {
        ok: false,
        error: 'error in mutation',
      };
    }
  }

  @Query(() => User)
  // @UseGuards(AuthGuard)
  @roleDec(['Any'])
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  // @UseGuards(AuthGuard)
  @roleDec(['Any'])
  @Query(() => UserProfileOutput)
  async userProfile(
    @Args() { userId }: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.UserService.findById(userId);
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'USER NOT FounD',
      };
    }
  }

  // @UseGuards(AuthGuard)
  @roleDec(['Any'])
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() AuthUser: User,
    @Args('input') EditProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.UserService.editProfile(AuthUser.id, EditProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => VerifyEmailOutput)
  getVerify(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.UserService.verifyEmail(code);
  }
}
