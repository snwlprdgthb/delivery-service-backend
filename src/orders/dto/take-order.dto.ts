import { InputType, PickType, ObjectType } from '@nestjs/graphql';
import { Order } from '../entity /order.enity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class TakeOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class TakeOrderOutput extends CreateAccountOutput {}
