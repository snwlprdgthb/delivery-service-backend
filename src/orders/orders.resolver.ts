import {
  Resolver,
  Query,
  Mutation,
  Args,
  ArgsType,
  Subscription,
} from '@nestjs/graphql';
import { Order, orderStatus } from './entity /order.enity';
import { OrderService } from './orders.service';
import { CreateOrderOutput, CreateOrderInput } from './dto/create.order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/users.module.entity';
import { roleDec } from 'src/auth/role-decorator';
import { GetOrdersOutput, GetOrdersInput } from './dto/get-orders.dto';
import { GetOrderOutput, GetOrderInput } from './dto/get-order.dto';
import { EditOrderOutput, EditOrderInput } from './dto/edit-order.dto';
import { Inject } from '@nestjs/common';
import {
  PUB_SUB,
  NEW_PENDING_ORDER,
  NEW_COOKED_ORDER,
  UPDATE_ORDER,
} from 'src/common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { UpdateOrderInput } from './dto/update.order.sub';
import { TakeOrderInput, TakeOrderOutput } from './dto/take-order.dto';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly OrderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @roleDec(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') CreateOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.OrderService.CreateOrder(customer, CreateOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @roleDec(['Any'])
  async getOrders(
    @AuthUser() User: User,
    @Args('input') GetOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.OrderService.getOrders(User, GetOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @roleDec(['Any'])
  async getOrder(
    @AuthUser() User: User,
    @Args('input') GetOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.OrderService.GetOrder(User, GetOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @roleDec(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') EditOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.OrderService.editOrder(user, EditOrderInput);
  }

  @Subscription(() => Order, {
    filter: ({ orderSubscr }, _, { user }) => {
      if (orderSubscr.ownerId === user.id) {
        return true;
      }
    },
    resolve: ({ orderSubscr }) => {
      return orderSubscr.order;
    },
  })
  @roleDec(['Owner'])
  orderSubscr() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order)
  @roleDec(['Delivery'])
  cookedOrderSub() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { updateOrder: order }: { updateOrder: Order },
      { input }: { input: UpdateOrderInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @roleDec(['Any'])
  updateOrder(@Args('input') UpdateOrderInput: UpdateOrderInput) {
    return this.pubSub.asyncIterator(UPDATE_ORDER);
  }

  @Mutation(() => TakeOrderOutput)
  @roleDec(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') TakeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.OrderService.takeOrder(driver, TakeOrderInput);
  }
}

// below you can see how graphql subscr works by web socket
// @Mutation(() => Boolean)
//   async potatoReady(@Args('id') id: number) {
//     await this.pubSub.publish('some', {
//       orderSubscription: id,
//     });
//     return true;
//   }

//   @Subscription(() => String, {
//     filter: ({ orderSubscription }, { id }) => {
//       return orderSubscription === id;
//     },
//     resolve: ({ orderSubscription }) => {
//       return `work with id ${orderSubscription}`;
//     },
//   })
//   @roleDec(['Any'])
//   orderSubscription(@Args('id') id: number) {
//     return this.pubSub.asyncIterator('some');
//   }
