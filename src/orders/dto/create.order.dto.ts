import { InputType, ObjectType, PickType, Field, Int } from '@nestjs/graphql';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Order } from '../entity /order.enity';
import { DishOptions } from 'src/restaurants/entities/dish.entity';
import { OrderItemOption } from '../entity /order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  restaId: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CreateAccountOutput {
  @Field(() => Int, { nullable: true })
  orderId?: number;
}
