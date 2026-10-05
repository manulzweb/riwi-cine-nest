// src/cinemas/entities/seat.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { SeatType } from './seat-type.entity';

@Entity({ name: 'seats' })
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id', type: 'int' })
  roomId: number;

  @Column({ name: 'seat_type_id', type: 'int' })
  seatTypeId: number;

  @Column({ type: 'varchar', length: 5 })
  row: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Room, (room) => room.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => SeatType, (seatType) => seatType.seats)
  @JoinColumn({ name: 'seat_type_id' })
  seatType: SeatType;
}
