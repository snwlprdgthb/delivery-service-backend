import { InputType, PickType, ObjectType } from '@nestjs/graphql';
import { Payment } from '../entities/payment-entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaId',
]) {}

@ObjectType()
export class CreatePaymentOutput extends CreateAccountOutput {}
