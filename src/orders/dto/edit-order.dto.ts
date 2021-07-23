import { InputType, PickType, ObjectType } from '@nestjs/graphql';
import { Order } from '../entity /order.enity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';

@InputType()
export class EditOrderInput extends PickType(Order, ['id', 'status']) {}

@ObjectType()
export class EditOrderOutput extends CreateAccountOutput {}
