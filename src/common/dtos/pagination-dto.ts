import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CreateAccountOutput {
  @Field(() => Int, { nullable: true })
  totalPages?: number;
}
