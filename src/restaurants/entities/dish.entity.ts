import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { ObjectType, InputType, Field, Int } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { IsString, Length, IsNumber } from 'class-validator';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(() => String)
  name: string;

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionsInputType', { isAbstract: true })
@ObjectType()
export class DishOptions {
  @Field(() => String)
  name: string;

  @Field(() => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(() => String)
  @Column()
  @Length(5, 100)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (resta) => resta.dishes, {
    onDelete: 'CASCADE',
  })
  restaraunt: Restaurant;

  @RelationId((dish: Dish) => dish.restaraunt)
  restaId: number;

  @Field(() => [DishOptions], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOptions[];
}
