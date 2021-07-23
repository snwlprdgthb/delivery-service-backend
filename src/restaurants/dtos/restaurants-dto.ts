import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination-dto';
import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field(() => Int, { nullable: true })
  totalItems?: number;
}
