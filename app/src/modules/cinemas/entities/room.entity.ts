// src/cinemas/entities/room.entity.ts

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
import { Cinema } from './cinema.entity.js';
import { Seat } from './seat.entity.js';

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  format: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'cinemaId', type: 'int' })
  cinemaId: number;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Cinema, (cinema) => cinema.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cinemaId' })
  cinema: Cinema;

  @OneToMany(() => Seat, (seat) => seat.room)
  seats: Seat[];
}
