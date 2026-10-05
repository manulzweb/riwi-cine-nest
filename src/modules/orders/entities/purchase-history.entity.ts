// src/orders/entities/purchase-history.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'purchase_histories' })
export class PurchaseHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true, unique: true })
  userId: number | null;

  @Column({ name: 'total_purchases', type: 'int', default: 0 })
  totalPurchases: number;

  @Column({
    name: 'total_spent',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalSpent: string;

  @Column({ name: 'last_purchase_at', type: 'timestamptz', nullable: true })
  lastPurchaseAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
