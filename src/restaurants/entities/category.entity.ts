import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsString, IsBoolean, Length, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  bgImg: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurants) => restaurants.category)
  restaurants: Restaurant[];
}
