import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CreateAccountOutput } from './create-account.dto';
import { User } from '../entities/users.module.entity';

@ArgsType()
export class UserProfileInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CreateAccountOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
