// src/showtimes/entities/cinema-function.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity.js';
import { Room } from '../../cinemas/entities/room.entity.js';

@Entity({ name: 'functions' })
export class CinemaFunction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movieId', type: 'int' })
  movieId: number;

  @Column({ name: 'roomId', type: 'int', nullable: true })
  roomId: number | null;

  @Column({ name: 'startTime', type: 'timestamptz', nullable: true })
  startTime: Date | null;

  @Column({ name: 'endTime', type: 'timestamptz', nullable: true })
  endTime: Date | null;

  @Column({ type: 'float8' })
  price: number;

  @Column({ name: 'availableSeats', type: 'int', default: 0 })
  availableSeats: number;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  format: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  room: string | null;

  @Column({ name: 'totalSeats', type: 'int', nullable: true })
  totalSeats: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Movie, (movie) => movie.functions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @ManyToOne(() => Room, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roomId' })
  roomRelation: Room;
}
