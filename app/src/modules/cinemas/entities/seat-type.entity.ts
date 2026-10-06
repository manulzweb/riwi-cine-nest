// src/cinemas/entities/seat-type.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Seat } from './seat.entity.js';

@Entity({ name: 'seat_types' })
export class SeatType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  description: string | null;

  @Column({
    name: 'price_factor',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: '1.00',
  })
  priceFactor: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Seat, (seat) => seat.seatType)
  seats: Seat[];
}
