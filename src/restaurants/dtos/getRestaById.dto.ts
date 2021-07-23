import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class getRestaByIdInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class getRestaByIdOutput extends CreateAccountOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
