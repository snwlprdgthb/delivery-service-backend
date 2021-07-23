import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
// import { bcrypt } from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entity /order.enity';
import { Payment } from 'src/payment/entities/payment-entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column({ select: false })
  @Field(() => String)
  password: string;

  @Column({ default: false })
  @Field(() => Boolean)
  emailVerify: boolean;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  role: UserRole;

  @Field(() => [Restaurant])
  @ManyToOne(() => Restaurant, (restaurants) => restaurants.user)
  restaurants: Restaurant[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];

  // {eager: true} in OneToMany give us info via relation in query
  @Field(() => [Payment], { nullable: true })
  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hash() {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(handlePass: string): Promise<boolean> {
    try {
      let isCheck = await bcrypt.compare(handlePass, this.password);
      return isCheck;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
