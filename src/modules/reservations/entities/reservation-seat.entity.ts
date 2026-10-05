// src/reservations/entities/reservation-seat.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Seat } from '../../cinemas/entities/seat.entity';

export enum ReservationSeatStatus {
  LOCKED = 'LOCKED',
  RELEASED = 'RELEASED',
  SOLD = 'SOLD',
}

@Entity({ name: 'reservation_seats' })
export class ReservationSeat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id', type: 'int' })
  reservationId: number;

  @Column({ name: 'seat_id', type: 'int' })
  seatId: number;

  @Column({
    type: 'enum',
    enum: ReservationSeatStatus,
    enumName: 'enum_reservation_seats_status',
    default: ReservationSeatStatus.LOCKED,
  })
  status: ReservationSeatStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Reservation, (reservation) => reservation.seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => Seat)
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;
}
