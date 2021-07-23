import { PickType, Field, ObjectType, InputType } from '@nestjs/graphql';
import { User } from '../entities/users.module.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'password',
  'email',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  ok: boolean;
}
