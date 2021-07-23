import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';

import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Category } from '../entities/category.entity';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination-dto';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class AllCategoriesOutput extends CreateAccountOutput {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}

@InputType()
export class findCategInput extends PaginationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class findCategOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => Int, { nullable: true })
  totalRes?: number;

  @Field(() => Restaurant, { nullable: true })
  restaurants?: Restaurant;
}
