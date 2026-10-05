// src/movies/entities/movie.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CinemaFunction } from '../../showtimes/entities/cinema-function.entity';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  synopsis: string;

  @Column({ type: 'varchar', length: 255 })
  director: string;

  @Column('text', { array: true, default: '{}' })
  actors: string[];

  @Column('text', { array: true, default: '{}' })
  genres: string[];

  @Column('text', { array: true, default: '{}' })
  languages: string[];

  @Column('text', { array: true, default: '{}' })
  formats: string[];

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'varchar', length: 50 })
  classification: string;

  @Column({ name: 'releaseDate', type: 'date' })
  releaseDate: string;

  @Column({ name: 'posterUrl', type: 'varchar', length: 500 })
  posterUrl: string;

  @Column({ name: 'bannerUrl', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string | null;

  @Column({ name: 'trailerUrl', type: 'varchar', length: 500, nullable: true })
  trailerUrl: string | null;

  @Column({
    name: 'averageRating',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  averageRating: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genre: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  language: string | null;

  @Column({
    name: 'isSubtitled',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isSubtitled: boolean | null;

  @Column({ type: 'float8', nullable: true, default: 0 })
  rating: number | null;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => CinemaFunction, (cinemaFunction) => cinemaFunction.movie)
  functions: CinemaFunction[];
}
