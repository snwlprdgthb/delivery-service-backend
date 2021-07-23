import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Raw } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/users.module.entity';
import { Category } from './entities/category.entity';
import {
  editRestaurantInput,
  editRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repository/category.repository';
import { EditProfileOutput } from 'src/users/dtos/edit-profile.dto';
import {
  AllCategoriesOutput,
  findCategInput,
  findCategOutput,
} from './dtos/all-categoreis.dto';
import { RestaurantsInput, RestaurantOutput } from './dtos/restaurants-dto';
import { getRestaByIdInput, getRestaByIdOutput } from './dtos/getRestaById.dto';
import {
  getRestaByQueryInput,
  getRestaByQueryOutput,
} from './dtos/getRestaByQuery.dto';
import { createDishInput, createDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import {
  EditDishInput,
  EditDishOutput,
  DeleteDishInput,
  DeleteDishOutput,
} from './dtos/edit/delete.dish.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { MyRestaOutput } from './dtos/my-restaurants.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,

    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createRestaurants(
    owner: User,
    CreateRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newResta = this.restaurants.create(CreateRestaurantInput);
      newResta.user = owner;

      let category = await this.categories.getOrCreate(
        CreateRestaurantInput.categoryName,
      );

      newResta.category = category;
      await this.restaurants.save(newResta);
      return {
        ok: true,
        restaId: newResta.id,
      };
    } catch (e) {
      return {
        ok: false,
        error: "couldn't create resta",
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: editRestaurantInput,
  ): Promise<editRestaurantOutput> {
    try {
      const resta = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        {
          loadRelationIds: true,
        },
      );
      if (!resta) {
        return {
          ok: false,
          error: 'there is no resta',
        };
      }
      if (owner.id !== resta.ownerId) {
        return { ok: false, error: 'you dont own this resta' };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteRestaurant(User, { id }): Promise<EditProfileOutput> {
    try {
      let resta = await this.restaurants.findOne(id, { loadRelationIds: true });
      if (User.id === resta.ownerId) {
        await this.restaurants.delete({ id });
        return { ok: true };
      }
      return { ok: false, error: 'not you resta' };
    } catch {
      return {
        ok: false,
        error: "can't delete resta",
      };
    }
  }

  async getAllCategories(): Promise<AllCategoriesOutput> {
    try {
      let categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async getCountRestaByCat(category: Category): Promise<number> {
    let res = await this.restaurants.count({ category });
    return res;
  }

  async findCategoryBySlug({
    slug,
    page,
  }: findCategInput): Promise<findCategOutput> {
    try {
      let category = await this.categories.findOne({ slug });

      if (!category) {
        return {
          ok: false,
          error: 'not found category',
        };
      }
      let restaPag = await this.restaurants.find({
        where: {
          category,
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurants = restaPag;
      let totalRes = await this.getCountRestaByCat(category);

      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalRes / 25),
        totalRes,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async restaurantsPagination({
    page,
  }: RestaurantsInput): Promise<RestaurantOutput> {
    try {
      let [pagResta, totalItems] = await this.restaurants.findAndCount({
        take: 3,
        skip: (page - 1) * 3,
        order: {
          isPromoted: 'DESC',
        },
      });
      if (!pagResta) {
        throw new Error();
      }

      return {
        ok: true,
        restaurants: pagResta,
        totalPages: Math.ceil(totalItems / 3),
        totalItems,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async getRestaurantById({
    id,
  }: getRestaByIdInput): Promise<getRestaByIdOutput> {
    try {
      let getResta = await this.restaurants.findOne(id, {
        relations: ['dishes'],
      });
      if (!getResta) {
        return {
          ok: false,
          error: "DB doesn't have a resta ",
        };
      }
      return {
        ok: true,
        restaurant: getResta,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async getRestaByQuery({
    query,
    page,
  }: getRestaByQueryInput): Promise<getRestaByQueryOutput> {
    try {
      let [resta, count] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${query}%'`),
        },
        take: 25,
        skip: (page - 1) * 25,
      });

      if (!!count) {
        return {
          ok: true,
          totalPages: Math.ceil(count / 25),
          restaurants: resta,
          totalItems: count,
        };
      }
      return {
        ok: false,
        error: "db doesn't include name which equal query",
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async MyRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { user: owner, id },
        { relations: ['dishes', 'orders'] },
      );
      console.log(restaurant);
      return {
        ok: true,
        restaurant,
      };
    } catch (e) {
      return {
        ok: false,
        error: "couldn't find resta",
      };
    }
  }

  async MyRestaurants(owner: User): Promise<MyRestaOutput> {
    try {
      console.log(owner);
      const resta = await this.restaurants.find({ user: owner });
      console.log(resta);
      return {
        restaurants: resta,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: "Couldn't find resta",
      };
    }
  }

  async createDish(
    User: User,
    createDishInput: createDishInput,
  ): Promise<createDishOutput> {
    try {
      let resta = await this.restaurants.findOne(createDishInput.restaurantId);
      if (!resta || resta.ownerId !== User.id) {
        return {
          ok: false,
          error: 'restaraunt not found',
        };
      }
      console.log(createDishInput);
      const dish = this.dishes.create(createDishInput);
      dish.restaraunt = resta;
      await this.dishes.save(dish);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async editDish(
    authUser: User,
    EditDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      let dish = await this.dishes.findOne(EditDishInput.dishIdToEdit, {
        relations: ['restaraunt'],
      });
      console.log(dish);
      if (!dish || dish.restaraunt.ownerId !== authUser.id) {
        return {
          ok: false,
          error: "db doesn't include dish",
        };
      }
      await this.dishes.save([
        {
          id: EditDishInput.dishIdToEdit,
          ...EditDishInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteDish(
    authUser: User,
    { dishIdtoDelete }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      let dish = await this.dishes.findOne(dishIdtoDelete);
      if (!dish || authUser.id !== dish.restaraunt.ownerId) {
        return {
          ok: false,
          error: "doesn't include dish or you don't own  resta or smth",
        };
      }
      await this.dishes.delete(dishIdtoDelete);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
