import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { updateRestaurantDto } from './dtos/update-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly RestaurantService: RestaurantService) {}
  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.RestaurantService.getAll();
  }
  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    console.log('sddssddssd0010101');
    try {
      await this.RestaurantService.createRestaurants(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args('id') id: number,
    @Args('data') data: updateRestaurantDto,
  ) {
    return true;
  }
}
