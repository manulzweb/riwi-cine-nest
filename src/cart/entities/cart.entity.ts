// src/cart/entities/cart.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { CartTicket } from './cart-ticket.entity';

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED',
}

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({
    type: 'enum',
    enum: CartStatus,
    enumName: 'enum_carts_status',
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({
    name: 'giftcard_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  giftcardAmount: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];

  @OneToMany(() => CartTicket, (ticket) => ticket.cart)
  tickets: CartTicket[];
}
