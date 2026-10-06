// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { EmailVerificationToken } from './entities/email-verification-token.entity.js';
import { LoginAudit } from './entities/login-audit.entity.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { RefreshTokenDao } from './dao/refresh-token.dao.js';
import { LoginAuditDao } from './dao/login-audit.dao.js';
import { EmailVerificationTokenDao } from './dao/email-verification-token.dao.js';
import { PasswordResetTokenDao } from './dao/password-reset-token.dao.js';
import { AuthMapper } from './mappers/auth.mapper.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RefreshToken,
      LoginAudit,
      EmailVerificationToken,
      PasswordResetToken,
    ]),
    JwtModule.register({}),
    CommonModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenDao,
    LoginAuditDao,
    EmailVerificationTokenDao,
    PasswordResetTokenDao,
    AuthMapper,
  ],
  exports: [
    AuthService,
    RefreshTokenDao,
    LoginAuditDao,
    EmailVerificationTokenDao,
    PasswordResetTokenDao,
    AuthMapper,
  ],
})
export class AuthModule {}
