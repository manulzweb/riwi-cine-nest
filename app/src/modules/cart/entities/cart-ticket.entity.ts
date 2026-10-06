// src/cart/entities/cart-ticket.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity.js';
import { CinemaFunction } from '../../showtimes/entities/cinema-function.entity.js';
import { Reservation } from '../../reservations/entities/reservation.entity.js';

@Entity({ name: 'cart_tickets' })
export class CartTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cart_id', type: 'int', nullable: true })
  cartId: number | null;

  @Column({ name: 'function_id', type: 'int', nullable: true })
  functionId: number | null;

  @Column({ name: 'reservation_id', type: 'int', nullable: true })
  reservationId: number | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => CinemaFunction)
  @JoinColumn({ name: 'function_id' })
  function: CinemaFunction;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}
