import { ObjectType, Field, InputType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  RelationId,
  OneToMany,
} from 'typeorm';
import { IsString, IsBoolean, Length, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Category } from './category.entity';
import { User } from 'src/users/entities/users.module.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entity /order.enity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;
  //   @Field(( ) => Boolean, { nullable: true })
  //   isGood?: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  bgImg: string;

  @Field(() => String, { nullable: true, defaultValue: 'SQL DEFAULT' })
  @Column({ default: 'TYPE ORM DEFAULT' })
  @IsOptional()
  @IsString()
  adress: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  user: User;

  @RelationId((resta: Restaurant) => resta.user)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaraunt)
  dishes?: Dish[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant)
  orders?: Order[];

  @Field(() => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;
}
