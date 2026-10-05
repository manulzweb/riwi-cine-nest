// src/locations/entities/city.entity.ts

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Cinema } from '../../cinemas/entities/cinema.entity';

@Entity({ name: 'cities' })
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId: number | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Department, (department) => department.cities, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Cinema, (cinema) => cinema.city)
  cinemas: Cinema[];
}
