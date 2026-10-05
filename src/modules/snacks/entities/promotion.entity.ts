// src/snacks/entities/promotion.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Snack } from './snack.entity';

export enum PromotionDiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

@Entity({ name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'snack_id', type: 'int', nullable: true })
  snackId: number | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: PromotionDiscountType,
    enumName: 'enum_promotions_discount_type',
  })
  discountType: PromotionDiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Snack, (snack) => snack.promotions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snack_id' })
  snack: Snack;
}
