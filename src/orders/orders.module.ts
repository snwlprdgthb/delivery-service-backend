import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity /order.enity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entity /order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
  providers: [OrderResolver, OrderService],
})
export class OrdersModule {}
