// src/snacks/entities/snack.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Promotion } from './promotion.entity.js';

@Entity({ name: 'snacks' })
export class Snack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'imageUrl', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({
    name: 'discountPercentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  discountPercentage: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Promotion, (promotion) => promotion.snack)
  promotions: Promotion[];
}
