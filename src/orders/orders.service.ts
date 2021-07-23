import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, orderStatus } from './entity /order.enity';
import { User, UserRole } from 'src/users/entities/users.module.entity';
import { CreateOrderOutput, CreateOrderInput } from './dto/create.order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entity /order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import {
  PUB_SUB,
  NEW_PENDING_ORDER,
  NEW_COOKED_ORDER,
  UPDATE_ORDER,
} from 'src/common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { TakeOrderInput, TakeOrderOutput } from './dto/take-order.dto';
import { GetPaymentOutput } from 'src/payment/dto/get-payment.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async CreateOrder(
    customer: User,
    { restaId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const resta = await this.restaurants.findOne(restaId);

      if (!resta) {
        return {
          ok: false,
          error: "db doesn't include resta. Sorry :(",
        };
      }

      let finalOrderPrice = 0;
      const itemsArray: OrderItem[] = [];

      for (let item of items) {
        const dish = await this.dishes.findOne({ id: item.dishId });

        if (!dish) {
          return {
            ok: false,
            error: "db doesn't include dish",
          };
        }

        finalOrderPrice += dish.price;

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              // console.log(`USD + ${dishOption.extra}`);
              finalOrderPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices?.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  // console.log(`USD + ${dishOptionChoice.extra}`);
                  finalOrderPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        // console.log(finalOrderPrice);

        const orderItemsInOrder = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );

        itemsArray.push(orderItemsInOrder);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant: resta,
          total: finalOrderPrice,
          items: itemsArray,
        }),
      );

      await this.pubSub.publish(NEW_PENDING_ORDER, {
        orderSubscr: { order, ownerId: resta.ownerId },
      });

      return {
        ok: true,
        orderId: order.id,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async getOrders(
    User: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let ordersArray: Order[];
      if (User.role === UserRole.Client) {
        ordersArray = await this.orders.find({
          where: {
            customer: User,
            ...(status && { status }),
          },
        });
      } else if (User.role === UserRole.Delivery) {
        ordersArray = await this.orders.find({
          where: {
            driver: User,
            ...(status && { status }),
          },
        });
      } else if (User.role === UserRole.Owner) {
        const resta = await this.restaurants.find({
          where: {
            user: User,
          },
          relations: ['orders'],
        });
        ordersArray = resta.map((resta) => resta.orders).flat(1); // because owner has many resta array, we need one
        if (status) {
          ordersArray = ordersArray.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders: ordersArray,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async GetOrder(User: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      let order: Order;
      if (User.role === UserRole.Client) {
        order = await this.orders.findOne({
          where: {
            customer: User,
            id,
          },
        });
      } else if (User.role === UserRole.Delivery) {
        order = await this.orders.findOne({
          where: {
            driver: User,
            id,
          },
        });
      } else if (User.role === UserRole.Owner) {
        let restaArray = await this.restaurants.find({
          where: {
            user: User,
          },
          relations: ['orders'],
          // select: ["orders"]
        });
        let test = restaArray
          .map((resta) => resta.orders)
          .flat(1)
          .filter((order) => order.id === id);

        if (test.length === 0) {
          return {
            ok: false,
          };
        }
        order = test[0];
      }
      return {
        ok: true,
        Order: order,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Error in catch',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async editOrder(
    user: User,
    { id, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(id);

      if (!order) {
        return {
          ok: false,
          error: `db doesn't include order by  ${id} id`,
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "you can't see order",
        };
      }
      let canEdit = true;
      if (user.role === UserRole.Client) {
        canEdit = false;
      }

      if (user.role === UserRole.Owner) {
        if (status !== orderStatus.Cooked && status !== orderStatus.Cooking) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== orderStatus.PickedUp &&
          status !== orderStatus.Delivered
        ) {
          canEdit = false;
        }
      }

      if (!canEdit) {
        return {
          ok: false,
          error: "You can't edit this",
        };
      }

      await this.orders.save({ id: id, status });

      if (user.role === UserRole.Owner && status === orderStatus.Cooked) {
        await this.pubSub.publish(NEW_COOKED_ORDER, {
          cookedOrderSub: { ...order, status },
        });
      }

      await this.pubSub.publish(UPDATE_ORDER, {
        updateOrder: { ...order, status },
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: true,
        error: 'error in main catch',
      };
    }
  }

  async takeOrder(
    driver: User,
    { id }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(id);
      if (!order) {
        return { ok: false, error: "db doesn't include order by this id" };
      }
      if (order.driver) {
        return {
          ok: false,
          error: 'order already has a driver',
        };
      }
      await this.orders.save({
        id,
        driver,
      });

      await this.pubSub.publish(UPDATE_ORDER, {
        updateOrder: { ...order, driver },
      });

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
