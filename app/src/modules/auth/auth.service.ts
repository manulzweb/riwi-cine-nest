// src/modules/auth/auth.service.ts

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokenDao } from './dao/refresh-token.dao.js';
import { LoginAuditDao } from './dao/login-audit.dao.js';
import { EmailVerificationTokenDao } from './dao/email-verification-token.dao.js';
import { PasswordResetTokenDao } from './dao/password-reset-token.dao.js';
import { EmailVerificationToken } from './entities/email-verification-token.entity.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { LoginAudit } from './entities/login-audit.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenDao: RefreshTokenDao,
    private readonly loginAuditDao: LoginAuditDao,
    private readonly emailTokenDao: EmailVerificationTokenDao,
    private readonly passwordResetTokenDao: PasswordResetTokenDao,
  ) {}

  async register(
    dto: RegisterDto,
    _meta?: { ip?: string; userAgent?: string },
  ) {
    const saltRounds = this.configService.get<number>(
      'security.bcryptSaltRounds',
      10,
    );
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      birthDate: dto.birthDate,
      phone: dto.phone,
      gender: dto.gender,
      personalDataConsent: dto.personalDataConsent,
      termsConsent: dto.termsConsent,
      commercialConsent: dto.commercialConsent,
    });

    // Create email verification token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawVerificationToken);

    const verificationToken = new EmailVerificationToken();
    verificationToken.userId = user.id;
    verificationToken.tokenHash = tokenHash;
    verificationToken.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.emailTokenDao.save(verificationToken);

    const tokens = await this.generateTokens(user);

    return {
      message: 'Usuario registrado exitosamente',
      user: this.usersService.sanitizeUser(user),
      tokens,
      verificationToken: rawVerificationToken,
    };
  }

  async login(dto: LoginDto, meta?: { ip?: string; userAgent?: string }) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      await this.recordAudit(null, dto.email, meta, 'FAILED', 'User not found');
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.recordAudit(
        user.id,
        dto.email,
        meta,
        'LOCKED',
        'Account temporarily locked',
      );
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_ACCOUNT_LOCKED',
        message:
          'Cuenta bloqueada temporalmente por exceso de intentos fallidos. Intente más tarde.',
      });
    }

    if (!user.isActive) {
      await this.recordAudit(
        user.id,
        dto.email,
        meta,
        'INACTIVE',
        'User inactive',
      );
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_ACCOUNT_INACTIVE',
        message:
          'La cuenta no se encuentra activa o su correo no ha sido verificado',
      });
    }

    if (!user.passwordHash) {
      await this.recordAudit(
        user.id,
        dto.email,
        meta,
        'FAILED',
        'No password set',
      );
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isMatch) {
      await this.usersService.recordFailedAttempt(user.id);
      await this.recordAudit(
        user.id,
        dto.email,
        meta,
        'FAILED',
        'Invalid password',
      );
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      });
    }

    await this.usersService.recordSuccessfulLogin(user.id);
    await this.recordAudit(
      user.id,
      dto.email,
      meta,
      'SUCCESS',
      'Login successful',
    );

    const tokens = await this.generateTokens(user);

    return {
      message: 'Inicio de sesión exitoso',
      user: this.usersService.sanitizeUser(user),
      tokens,
    };
  }

  async refreshTokens(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Token de refresco no proporcionado',
      });
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const existingToken = await this.refreshTokenDao.findByToken(tokenHash);

    if (!existingToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Token de refresco no encontrado',
      });
    }

    // Reuse detection: if token is already revoked, potential token theft
    if (existingToken.isRevoked) {
      if (existingToken.userId) {
        await this.refreshTokenDao.revokeAllUserTokens(existingToken.userId);
      }
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_TOKEN_REVOKED',
        message:
          'Reutilización de token detectada. La sesión ha sido revocada por seguridad.',
      });
    }

    if (existingToken.expiresAt < new Date()) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'El token de refresco ha expirado',
      });
    }

    // Revoke old token
    existingToken.isRevoked = true;
    await this.refreshTokenDao.save(existingToken);

    if (!existingToken.user) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Usuario no encontrado',
      });
    }

    // Generate new pair
    const tokens = await this.generateTokens(existingToken.user);

    return {
      message: 'Tokens renovados exitosamente',
      tokens,
    };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.refreshTokenDao.update({ tokenHash }, { isRevoked: true });
    }
    return { message: 'Sesión cerrada exitosamente' };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const verificationRecord = await this.emailTokenDao.findByToken(tokenHash);

    if (!verificationRecord) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Token de verificación inválido',
      });
    }

    if (verificationRecord.expiresAt < new Date()) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'El token de verificación ha expirado',
      });
    }

    if (verificationRecord.usedAt) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'El token de verificación ya fue utilizado',
      });
    }

    verificationRecord.usedAt = new Date();
    await this.emailTokenDao.save(verificationRecord);

    await this.usersService.updateStatus(verificationRecord.userId, true);
    const user = await this.usersService.findById(verificationRecord.userId);
    if (user) {
      user.emailVerifiedAt = new Date();
      await this.usersService.saveUser(user);
    }

    return { message: 'Correo electrónico verificado exitosamente' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message: 'Si el correo existe, se ha enviado un enlace de recuperación',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const resetToken = new PasswordResetToken();
    resetToken.userId = user.id;
    resetToken.tokenHash = tokenHash;
    resetToken.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.passwordResetTokenDao.save(resetToken);

    return {
      message: 'Si el correo existe, se ha enviado un enlace de recuperación',
      resetToken: rawToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const resetRecord = await this.passwordResetTokenDao.findByToken(tokenHash);

    if (!resetRecord) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Token de recuperación inválido',
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'El token de recuperación ha expirado',
      });
    }

    if (resetRecord.usedAt) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'El token de recuperación ya fue utilizado',
      });
    }

    const saltRounds = this.configService.get<number>(
      'security.bcryptSaltRounds',
      10,
    );
    const newPasswordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    resetRecord.usedAt = new Date();
    await this.passwordResetTokenDao.save(resetRecord);

    const user = await this.usersService.findById(resetRecord.userId);
    if (user) {
      user.passwordHash = newPasswordHash;
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.usersService.saveUser(user);
    }

    return { message: 'Contraseña restablecida exitosamente' };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret = this.configService.get<string>('jwt.accessSecret');
    const accessExpiresIn = this.configService.get<string>(
      'jwt.accessExpiresIn',
      '15m',
    );

    const roleName = user.role?.name || 'cliente';

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: roleName,
        tokenType: 'ACCESS',
      },
      {
        secret: accessSecret,
        expiresIn: (accessExpiresIn as '15m') || '15m',
      },
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const refreshTokenEntity = new RefreshToken();
    refreshTokenEntity.userId = user.id;
    refreshTokenEntity.tokenHash = tokenHash;
    refreshTokenEntity.expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 days
    refreshTokenEntity.isRevoked = false;

    await this.refreshTokenDao.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async recordAudit(
    userId: number | null,
    email: string,
    meta?: { ip?: string; userAgent?: string },
    status = 'SUCCESS',
    reason?: string,
  ) {
    try {
      const audit = new LoginAudit();
      audit.userId = userId;
      audit.emailAttempted = email;
      audit.ipAddress = meta?.ip || null;
      audit.deviceUserAgent = meta?.userAgent || null;
      audit.status = `${status}${reason ? `: ${reason}` : ''}`;

      await this.loginAuditDao.save(audit);
    } catch {
      // Audit failure shouldn't abort the auth flow
    }
  }
}
