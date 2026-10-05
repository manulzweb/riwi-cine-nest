// src/locations/entities/department.entity.ts

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity({ name: 'departments' })
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'country_id', type: 'int', nullable: true })
  countryId: number | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Country, (country) => country.departments, { nullable: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @OneToMany(() => City, (city) => city.department)
  cities: City[];
}
