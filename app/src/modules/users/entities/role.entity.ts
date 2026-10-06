// src/users/entities/role.entity.ts

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string | null;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
