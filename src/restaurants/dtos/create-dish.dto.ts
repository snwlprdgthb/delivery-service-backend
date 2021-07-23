import { PickType, Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class createDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class createDishOutput extends CreateAccountOutput {}
