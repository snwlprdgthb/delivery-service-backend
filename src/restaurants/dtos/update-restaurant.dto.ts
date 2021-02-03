import { InputType, PartialType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from './create-restaurant.dto';

@InputType()
export class updateRestaurantDto extends PartialType(CreateRestaurantDto) {}
