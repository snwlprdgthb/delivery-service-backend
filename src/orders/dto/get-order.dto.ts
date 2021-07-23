import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';
import { Order } from '../entity /order.enity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOutput extends CreateAccountOutput {
  @Field(() => Order, { nullable: true })
  Order?: Order;
}
