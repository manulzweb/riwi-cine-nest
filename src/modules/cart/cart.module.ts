import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartTicket } from './entities/cart-ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, CartTicket])],
  exports: [TypeOrmModule],
})
export class CartModule {}
