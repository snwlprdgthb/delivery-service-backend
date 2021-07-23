import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination-dto';
import { RestaurantOutput } from './restaurants-dto';

@InputType()
export class getRestaByQueryInput extends PaginationInput {
  @Field(() => String)
  query: string;
}

@ObjectType()
export class getRestaByQueryOutput extends RestaurantOutput {}
