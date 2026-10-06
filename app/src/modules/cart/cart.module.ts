// src/modules/cart/cart.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity.js';
import { CartItem } from './entities/cart-item.entity.js';
import { CartTicket } from './entities/cart-ticket.entity.js';
import { CartDao } from './dao/cart.dao.js';
import { CartItemDao } from './dao/cart-item.dao.js';
import { CartTicketDao } from './dao/cart-ticket.dao.js';
import { CartMapper } from './mappers/cart.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, CartTicket])],
  providers: [CartDao, CartItemDao, CartTicketDao, CartMapper],
  exports: [CartDao, CartItemDao, CartTicketDao, CartMapper, TypeOrmModule],
})
export class CartModule {}
