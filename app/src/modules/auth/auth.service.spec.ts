// src/modules/auth/auth.service.spec.ts

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenDao } from './dao/refresh-token.dao.js';
import { LoginAuditDao } from './dao/login-audit.dao.js';
import { EmailVerificationTokenDao } from './dao/email-verification-token.dao.js';
import { PasswordResetTokenDao } from './dao/password-reset-token.dao.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let configService: any;
  let refreshTokenDao: any;
  let loginAuditDao: any;
  let emailTokenDao: any;
  let passwordResetTokenDao: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      recordFailedAttempt: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
      sanitizeUser: jest.fn((u) => u),
      updateStatus: jest.fn(),
      saveUser: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'security.bcryptSaltRounds') return 10;
        if (key === 'jwt.accessSecret') return 'access-secret';
        if (key === 'jwt.accessExpiresIn') return '15m';
        return defaultValue;
      }),
    };

    refreshTokenDao = {
      findByToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      save: jest.fn((d) => Promise.resolve({ id: 1, ...d })),
      update: jest.fn(),
    };

    loginAuditDao = {
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    emailTokenDao = {
      findByToken: jest.fn(),
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    passwordResetTokenDao = {
      findByToken: jest.fn(),
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: RefreshTokenDao, useValue: refreshTokenDao },
        { provide: LoginAuditDao, useValue: loginAuditDao },
        { provide: EmailVerificationTokenDao, useValue: emailTokenDao },
        { provide: PasswordResetTokenDao, useValue: passwordResetTokenDao },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe registrar un usuario y generar tokens + token de verificación', async () => {
      const mockCreatedUser = {
        id: 1,
        email: 'test@example.com',
        role: { name: 'cliente' },
        isActive: true,
      };
      usersService.createUser.mockResolvedValue(mockCreatedUser);

      const res = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Juan',
        lastName: 'Pérez',
        documentType: 'CC',
        documentNumber: '12345678',
        birthDate: '1995-05-15',
        phone: '3001234567',
      });

      expect(res.message).toBe('Usuario registrado exitosamente');
      expect(res.tokens.accessToken).toBe('mock-jwt-token');
      expect(res.verificationToken).toBeDefined();
      expect(emailTokenDao.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debe autenticar con credenciales correctas y emitir tokens', async () => {
      const hash = await bcrypt.hash('CorrectPassword123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: hash,
        isActive: true,
        lockedUntil: null,
        role: { name: 'cliente' },
      });

      const res = await service.login({
        email: 'test@example.com',
        password: 'CorrectPassword123!',
      });

      expect(res.message).toBe('Inicio de sesión exitoso');
      expect(res.tokens.accessToken).toBe('mock-jwt-token');
      expect(usersService.recordSuccessfulLogin).toHaveBeenCalledWith(1);
    });

    it('debe rechazar contraseña incorrecta, registrar intento fallido y auditoría', async () => {
      const hash = await bcrypt.hash('CorrectPassword123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: hash,
        isActive: true,
        lockedUntil: null,
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.recordFailedAttempt).toHaveBeenCalledWith(1);
      expect(loginAuditDao.save).toHaveBeenCalled();
    });

    it('debe rechazar usuario inexistente', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAuditDao.save).toHaveBeenCalled();
    });

    it('debe rechazar usuario bloqueado temporalmente', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'locked@test.com',
        isActive: true,
        lockedUntil: new Date(Date.now() + 600000), // locked for 10 min
      });

      await expect(
        service.login({ email: 'locked@test.com', password: 'AnyPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar usuario inactivo', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'inactive@test.com',
        isActive: false,
      });

      await expect(
        service.login({ email: 'inactive@test.com', password: 'AnyPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('debe arrojar 401 si no se envía token de refresco', async () => {
      await expect(service.refreshTokens('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe detectar reutilización de token revocado y revocar tokens del usuario', async () => {
      refreshTokenDao.findByToken.mockResolvedValue({
        id: 10,
        userId: 5,
        isRevoked: true,
      });

      await expect(service.refreshTokens('already-used-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(refreshTokenDao.revokeAllUserTokens).toHaveBeenCalledWith(5);
    });

    it('debe renovar tokens y revocar el token anterior exitosamente', async () => {
      refreshTokenDao.findByToken.mockResolvedValue({
        id: 10,
        userId: 5,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        user: { id: 5, email: 'u@test.com', role: { name: 'cliente' } },
      });

      const res = await service.refreshTokens('valid-refresh-token');

      expect(res.tokens.accessToken).toBe('mock-jwt-token');
      expect(refreshTokenDao.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRevoked: true }),
      );
    });
  });

  describe('logout', () => {
    it('debe marcar token como revocado si se proporciona', async () => {
      const res = await service.logout('token-to-revoke');
      expect(res.message).toBe('Sesión cerrada exitosamente');
      expect(refreshTokenDao.update).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('debe verificar correo con token válido', async () => {
      emailTokenDao.findByToken.mockResolvedValue({
        id: 1,
        userId: 3,
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
      });
      usersService.findById.mockResolvedValue({ id: 3, emailVerifiedAt: null });

      const res = await service.verifyEmail('valid-verify-token');
      expect(res.message).toBe('Correo electrónico verificado exitosamente');
      expect(usersService.updateStatus).toHaveBeenCalledWith(3, true);
    });

    it('debe rechazar token de verificación inexistente o expirado', async () => {
      emailTokenDao.findByToken.mockResolvedValue(null);
      await expect(service.verifyEmail('nonexistent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword & resetPassword', () => {
    it('debe generar token de recuperación si el correo existe', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 2,
        email: 'user@test.com',
      });
      const res = await service.forgotPassword('user@test.com');
      expect(res.message).toContain('enviado un enlace');
      expect(res.resetToken).toBeDefined();
      expect(passwordResetTokenDao.save).toHaveBeenCalled();
    });

    it('debe restablecer contraseña con token válido', async () => {
      passwordResetTokenDao.findByToken.mockResolvedValue({
        id: 1,
        userId: 2,
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
      });
      usersService.findById.mockResolvedValue({ id: 2, passwordHash: 'old' });

      const res = await service.resetPassword({
        token: 'valid-reset-token',
        newPassword: 'NewPassword123!',
      });

      expect(res.message).toBe('Contraseña restablecida exitosamente');
      expect(passwordResetTokenDao.save).toHaveBeenCalledWith(
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });
  });
});
