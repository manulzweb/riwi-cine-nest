// src/users/entities/profile.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { City } from '../../locations/entities/city.entity';
import { Cinema } from '../../cinemas/entities/cinema.entity';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'document_type', type: 'varchar', length: 20 })
  documentType: string;

  @Column({ name: 'document_number', type: 'varchar', length: 30 })
  documentNumber: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @Column({ name: 'favorite_cinema_id', type: 'int', nullable: true })
  favoriteCinemaId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => City, { nullable: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @ManyToOne(() => Cinema, { nullable: true })
  @JoinColumn({ name: 'favorite_cinema_id' })
  favoriteCinema: Cinema;
}
