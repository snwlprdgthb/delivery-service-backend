import {
  InputType,
  PickType,
  PartialType,
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

// edit dish

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'photo',
  'price',
  'options',
  'description',
]) {
  @Field(() => Int)
  dishIdToEdit: number;
}

@ObjectType()
export class EditDishOutput extends CreateAccountOutput {}

//delete dish

@InputType()
export class DeleteDishInput {
  @Field(() => Int)
  dishIdtoDelete: string;
}

@ObjectType()
export class DeleteDishOutput extends CreateAccountOutput {}
