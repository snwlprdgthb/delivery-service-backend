import { CreateAccountOutput } from './create-account.dto';
import { ObjectType, InputType, PickType, PartialType } from '@nestjs/graphql';
import { User } from '../entities/users.module.entity';

@ObjectType()
export class EditProfileOutput extends CreateAccountOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
