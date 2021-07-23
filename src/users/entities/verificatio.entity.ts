import { InputType, ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  BeforeRemove,
} from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from './users.module.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User; // maybe without types

  @BeforeInsert()
  createCode(): void {
    console.log(this);
    const testCode: string = Math.random().toString(36);
    this.code = testCode;
  }
}
