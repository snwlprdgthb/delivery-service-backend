import {
  InputType,
  ObjectType,
  registerEnumType,
  Field,
  Float,
} from '@nestjs/graphql';
import { User } from 'src/users/entities/users.module.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import {
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Entity,
  RelationId,
} from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { OrderItem } from './order-item.entity';
import { IsNumber, IsEnum, isEnum } from 'class-validator';

export enum orderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(orderStatus, { name: 'odrerStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field(() => User, { nullable: true })
  customer?: User;

  @RelationId((order: Order) => order.customer) // how i get id customer through relation
  customerId: number;

  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field(() => User, { nullable: true })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];

  @Field(() => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: orderStatus, default: orderStatus.Pending })
  @Field(() => orderStatus)
  @IsEnum(orderStatus)
  status: orderStatus;
}
