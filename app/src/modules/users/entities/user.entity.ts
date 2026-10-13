// src/users/entities/user.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity.js';
import { Profile } from './profile.entity.js';
import { RefreshToken } from '../../auth/entities/refresh-token.entity.js';
import { LoginAudit } from '../../auth/entities/login-audit.entity.js';
import { EmailVerificationToken } from '../../auth/entities/email-verification-token.entity.js';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity.js';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'personal_data_consent', type: 'boolean', default: false })
  personalDataConsent: boolean;

  @Column({ name: 'terms_consent', type: 'boolean', default: false })
  termsConsent: boolean;

  @Column({ name: 'commercial_consent', type: 'boolean', default: false })
  commercialConsent: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: Relation<RefreshToken[]>;

  @OneToMany(() => LoginAudit, (audit) => audit.user)
  loginAudits: Relation<LoginAudit[]>;

  @OneToMany(() => EmailVerificationToken, (token) => token.user)
  emailVerificationTokens: Relation<EmailVerificationToken[]>;

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: Relation<PasswordResetToken[]>;
}
