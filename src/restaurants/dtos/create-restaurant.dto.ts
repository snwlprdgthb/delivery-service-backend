import { Field, ArgsType, InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, [
  'id',
  //   'ownerName',
  //   'categoryName',
]) {}
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
