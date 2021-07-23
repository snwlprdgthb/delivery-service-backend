import { PickType, InputType } from '@nestjs/graphql';
import { Order } from '../entity /order.enity';

@InputType()
export class UpdateOrderInput extends PickType(Order, ['id']) {}
