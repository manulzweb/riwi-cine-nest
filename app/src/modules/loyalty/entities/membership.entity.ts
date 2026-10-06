// src/loyalty/entities/membership.entity.ts

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
import { User } from '../../users/entities/user.entity.js';
import { MembershipLevel } from './membership-level.entity.js';
import { MembershipStatus } from './membership-status.entity.js';

@Entity({ name: 'memberships' })
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'level_id', type: 'int' })
  levelId: number;

  @Column({ name: 'status_id', type: 'int' })
  statusId: number;

  @Column({ name: 'points_balance', type: 'int', default: 0 })
  pointsBalance: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => MembershipLevel)
  @JoinColumn({ name: 'level_id' })
  level: MembershipLevel;

  @ManyToOne(() => MembershipStatus)
  @JoinColumn({ name: 'status_id' })
  status: MembershipStatus;
}
