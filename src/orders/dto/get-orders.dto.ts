import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { orderStatus, Order } from '../entity /order.enity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class GetOrdersInput {
  @Field(() => orderStatus, { nullable: true })
  status: orderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CreateAccountOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
