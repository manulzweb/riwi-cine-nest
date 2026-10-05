import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { LoginAudit } from './entities/login-audit.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailVerificationToken,
      LoginAudit,
      PasswordResetToken,
      RefreshToken,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AuthModule {}
