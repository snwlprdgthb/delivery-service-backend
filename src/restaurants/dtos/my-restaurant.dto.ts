import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class MyRestaurantOutput extends CreateAccountOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
