import { ObjectType, Field } from '@nestjs/graphql';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Payment } from '../entities/payment-entity';

@ObjectType()
export class GetPaymentOutput extends CreateAccountOutput {
  @Field(() => [Payment], { nullable: true })
  payments?: Payment[];
}
