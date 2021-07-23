import { ObjectType, InputType, PickType } from '@nestjs/graphql';
import { CreateAccountOutput } from './create-account.dto';
import { Verification } from '../entities/verificatio.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyEmailOutput extends CreateAccountOutput {}
