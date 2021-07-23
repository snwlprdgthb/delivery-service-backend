import {
  Field,
  ArgsType,
  InputType,
  OmitType,
  ObjectType,
  PickType,
  Int,
} from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'bgImg',
  'adress',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CreateAccountOutput {
  @Field(() => Int, { nullable: true })
  restaId?: number;
}

// also we can use InputType as third argument instead use decorator -
//  @InputType({isAbstract: true}) in entity file

// @ArgsType()
// export class CreateRestaurantDto {
//   @Field(() => String)
//   @IsString()
//   name: string;

//   @Field(() => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(() => String)
//   @IsString()
//   adress: string;

//   @Field(() => String)
//   @IsString()
//   @Length(5, 10)
//   ownerName: string;
// }
