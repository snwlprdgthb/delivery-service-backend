import {
  Query,
  Mutation,
  Resolver,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User, UserRole } from 'src/users/entities/users.module.entity';
import { SetMetadata } from '@nestjs/common';
import { roleDec } from 'src/auth/role-decorator';
import {
  editRestaurantOutput,
  editRestaurantInput,
  deleteRestaurantInput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import {
  AllCategoriesOutput,
  findCategInput,
  findCategOutput,
} from './dtos/all-categoreis.dto';
import { RestaurantOutput, RestaurantsInput } from './dtos/restaurants-dto';
import { getRestaByIdOutput, getRestaByIdInput } from './dtos/getRestaById.dto';
import {
  getRestaByQueryInput,
  getRestaByQueryOutput,
} from './dtos/getRestaByQuery.dto';
import { Dish } from './entities/dish.entity';
import { createDishOutput, createDishInput } from './dtos/create-dish.dto';
import {
  EditDishInput,
  EditDishOutput,
  DeleteDishOutput,
  DeleteDishInput,
} from './dtos/edit/delete.dish.dto';
import { MyRestaOutput } from './dtos/my-restaurants.dto';
import {
  MyRestaurantOutput,
  MyRestaurantInput,
} from './dtos/my-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly RestaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @roleDec(['Owner'])
  async createRestaurant(
    @AuthUser() AuthUser: User,
    @Args('input') CreateRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.RestaurantService.createRestaurants(
      AuthUser,
      CreateRestaurantInput,
    );
  }

  @Mutation(() => editRestaurantOutput)
  @roleDec(['Owner'])
  async editRestaurant(
    @AuthUser() AuthUser: User,
    @Args('input') editRestaurantInput: editRestaurantInput,
  ): Promise<editRestaurantOutput> {
    return this.RestaurantService.editRestaurant(AuthUser, editRestaurantInput);
  }

  @Mutation(() => editRestaurantOutput)
  @roleDec(['Owner'])
  async deleteRestaurant(
    @Args('input') deleteRestaurantInput: deleteRestaurantInput,
    @AuthUser() AuthUser: User,
  ): Promise<editRestaurantOutput> {
    return this.RestaurantService.deleteRestaurant(
      AuthUser,
      deleteRestaurantInput,
    );
  }

  @Query(() => RestaurantOutput)
  restaurantsPagination(
    @Args('input') RestaurantsInput: RestaurantsInput,
  ): Promise<RestaurantOutput> {
    return this.RestaurantService.restaurantsPagination(RestaurantsInput);
  }

  @Query(() => getRestaByIdOutput)
  getRestaurantById(
    @Args('input') getRestaByIdInput: getRestaByIdInput,
  ): Promise<getRestaByIdOutput> {
    return this.RestaurantService.getRestaurantById(getRestaByIdInput);
  }

  @Query(() => MyRestaOutput)
  @roleDec(['Owner'])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaOutput> {
    return this.RestaurantService.MyRestaurants(owner);
  }

  @Query(() => MyRestaurantOutput)
  @roleDec(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.RestaurantService.MyRestaurant(owner, myRestaurantInput);
  }

  @Query(() => getRestaByQueryOutput)
  getRestaByQuery(
    @Args('input') getRestaByQueryInput: getRestaByQueryInput,
  ): Promise<getRestaByQueryOutput> {
    return this.RestaurantService.getRestaByQuery(getRestaByQueryInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly RestarauntService: RestaurantService) {}

  @ResolveField(() => Number)
  restaCount(@Parent() category: Category): Promise<Number> {
    return this.RestarauntService.getCountRestaByCat(category);
  }

  @Query(() => AllCategoriesOutput)
  getAllCategories(): Promise<AllCategoriesOutput> {
    return this.RestarauntService.getAllCategories();
  }

  @Query(() => findCategOutput)
  findCategoryBySlug(
    @Args('input') findCategInput: findCategInput,
  ): Promise<findCategOutput> {
    return this.RestarauntService.findCategoryBySlug(findCategInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly RestaurantService: RestaurantService) {}

  @Mutation(() => createDishOutput)
  @roleDec(['Owner'])
  createDish(
    @AuthUser() AuthUser: User,
    @Args('input') createDishInput: createDishInput,
  ): Promise<createDishOutput> {
    return this.RestaurantService.createDish(AuthUser, createDishInput);
  }

  @Mutation(() => EditDishOutput)
  @roleDec(['Owner'])
  editDish(
    @AuthUser() AuthUser: User,
    @Args('input') editRestaurantInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.RestaurantService.editDish(AuthUser, editRestaurantInput);
  }

  @Mutation(() => DeleteDishOutput)
  @roleDec(['Owner'])
  deleteDish(
    @AuthUser() AuthUser: User,
    @Args('input') DeleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.RestaurantService.deleteDish(AuthUser, DeleteDishInput);
  }
}
