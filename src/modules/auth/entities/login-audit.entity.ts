// src/auth/entities/login-audit.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'login_audits' })
export class LoginAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'email_attempted', type: 'varchar', length: 255 })
  emailAttempted: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 255, nullable: true })
  ipAddress: string | null;

  @Column({
    name: 'device_user_agent',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  deviceUserAgent: string | null;

  @Column({ type: 'varchar', length: 255 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.loginAudits, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
