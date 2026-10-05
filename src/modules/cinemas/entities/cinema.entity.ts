// src/cinemas/entities/cinema.entity.ts

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
import { City } from '../../locations/entities/city.entity';
import { Room } from './room.entity';

@Entity({ name: 'cinemas' })
export class Cinema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => City, (city) => city.cinemas, { nullable: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @OneToMany(() => Room, (room) => room.cinema)
  rooms: Room[];
}
