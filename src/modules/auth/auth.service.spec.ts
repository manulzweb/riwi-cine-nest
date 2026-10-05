// src/modules/auth/auth.service.spec.ts

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { LoginAudit } from './entities/login-audit.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let configService: any;
  let refreshTokenRepo: any;
  let loginAuditRepo: any;
  let emailTokenRepo: any;
  let passwordResetTokenRepo: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      recordFailedAttempt: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
      sanitizeUser: jest.fn((u) => u),
      updateStatus: jest.fn(),
      userRepo: { save: jest.fn() },
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

    refreshTokenRepo = {
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve({ id: 1, ...d })),
      update: jest.fn(),
    };

    loginAuditRepo = {
      create: jest.fn((d) => d),
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    emailTokenRepo = {
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    passwordResetTokenRepo = {
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepo,
        },
        { provide: getRepositoryToken(LoginAudit), useValue: loginAuditRepo },
        {
          provide: getRepositoryToken(EmailVerificationToken),
          useValue: emailTokenRepo,
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: passwordResetTokenRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe registrar un usuario y generar tokens + token de verificación', async () => {
      usersService.createUser.mockResolvedValue({
        id: 1,
        email: 'new@riwicine.com',
        role: { name: 'cliente' },
      });

      const res = await service.register({
        email: 'new@riwicine.com',
        password: 'Password123!',
        firstName: 'Laura',
        lastName: 'Muñoz',
        documentType: 'CC',
        documentNumber: '112233',
        birthDate: '1998-04-20',
        phone: '3109876543',
        personalDataConsent: true,
        termsConsent: true,
      });

      expect(res.message).toBe('Usuario registrado exitosamente');
      expect(res.tokens.accessToken).toBe('mock-jwt-token');
      expect(res.verificationToken).toBeDefined();
      expect(emailTokenRepo.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debe autenticar con credenciales correctas y emitir tokens', async () => {
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        passwordHash,
        isActive: true,
        lockedUntil: null,
        role: { name: 'cliente' },
      });

      const result = await service.login({
        email: 'user@test.com',
        password: 'Secret123!',
      });

      expect(result.message).toBe('Inicio de sesión exitoso');
      expect(result.tokens.accessToken).toBe('mock-jwt-token');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(usersService.recordSuccessfulLogin).toHaveBeenCalledWith(1);
      expect(loginAuditRepo.save).toHaveBeenCalled();
    });

    it('debe rechazar contraseña incorrecta, registrar intento fallido y auditoría', async () => {
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        passwordHash,
        isActive: true,
        lockedUntil: null,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.recordFailedAttempt).toHaveBeenCalledWith(1);
      expect(loginAuditRepo.save).toHaveBeenCalled();
    });

    it('debe rechazar usuario inexistente', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@test.com',
          password: 'AnyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
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
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 10,
        userId: 5,
        isRevoked: true,
      });

      await expect(service.refreshTokens('already-used-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: 5 },
        { isRevoked: true },
      );
    });

    it('debe renovar tokens y revocar el token anterior exitosamente', async () => {
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 10,
        userId: 5,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        user: { id: 5, email: 'u@test.com', role: { name: 'cliente' } },
      });

      const res = await service.refreshTokens('valid-refresh-token');

      expect(res.tokens.accessToken).toBe('mock-jwt-token');
      expect(refreshTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRevoked: true }),
      );
    });
  });

  describe('logout', () => {
    it('debe marcar token como revocado si se proporciona', async () => {
      const res = await service.logout('token-to-revoke');
      expect(res.message).toBe('Sesión cerrada exitosamente');
      expect(refreshTokenRepo.update).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('debe verificar correo con token válido', async () => {
      emailTokenRepo.findOne.mockResolvedValue({
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
      emailTokenRepo.findOne.mockResolvedValue(null);
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
      expect(passwordResetTokenRepo.save).toHaveBeenCalled();
    });

    it('debe restablecer contraseña con token válido', async () => {
      passwordResetTokenRepo.findOne.mockResolvedValue({
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
      expect(passwordResetTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });
  });
});
