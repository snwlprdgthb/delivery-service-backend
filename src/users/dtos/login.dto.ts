import { CreateAccountOutput } from './create-account.dto';
import { ObjectType, PickType, InputType, Field } from '@nestjs/graphql';
import { User } from '../entities/users.module.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CreateAccountOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
