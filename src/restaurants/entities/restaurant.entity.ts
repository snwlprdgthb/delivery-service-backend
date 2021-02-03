import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsBoolean, Length, IsOptional } from 'class-validator';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;
  //   @Field(( ) => Boolean, { nullable: true })
  //   isGood?: boolean;

  // @Field(() => Boolean, { nullable: true }) //graphql
  // @Column({ default: true }) // database
  // @IsOptional() // class-valid
  // @IsBoolean() // class-valid
  // isVegan: boolean;

  // @Field(() => String, { nullable: true })
  // @Column()
  // @IsOptional()
  // @IsString()
  // adress: string;

  // @Field(() => String, { defaultValue: 'defaultField' })
  // @Column({ default: 'default' })
  // @IsOptional()
  // @IsString()
  // ownerName: string;

  // @Column()
  // @Field(() => String)
  // @IsString()
  // categoryName: string;
}
