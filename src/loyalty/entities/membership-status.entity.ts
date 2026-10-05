// src/loyalty/entities/membership-status.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'membership_statuses' })
export class MembershipStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  description: string | null;
}
