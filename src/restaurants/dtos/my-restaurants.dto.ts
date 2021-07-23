import { ObjectType, Field } from '@nestjs/graphql';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class MyRestaOutput extends CreateAccountOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
