import {
  InputType,
  PickType,
  OmitType,
  ObjectType,
  PartialType,
  Field,
} from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';
import { CoreEntity } from 'src/common/entities/core.entity';

@InputType()
export class editRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => Number)
  restaurantId: number;
}

@InputType()
export class deleteRestaurantInput extends PickType(CoreEntity, ['id']) {}

@ObjectType()
export class editRestaurantOutput extends CreateAccountOutput {}
