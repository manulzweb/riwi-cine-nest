// src/reservations/entities/reservation.entity.ts

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
import { CinemaFunction } from '../../showtimes/entities/cinema-function.entity';
import { ReservationSeat } from './reservation-seat.entity';

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
  CONFIRMED = 'CONFIRMED',
}

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'function_id', type: 'int' })
  functionId: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    enumName: 'enum_reservations_status',
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CinemaFunction)
  @JoinColumn({ name: 'function_id' })
  function: CinemaFunction;

  @OneToMany(() => ReservationSeat, (seat) => seat.reservation)
  seats: ReservationSeat[];
}
