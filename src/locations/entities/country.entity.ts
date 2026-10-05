// src/locations/entities/country.entity.ts

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from './department.entity';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Department, (department) => department.country)
  departments: Department[];
}
