// src/common/guards/auth.guard.spec.ts

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as any;

    guard = new AuthGuard(jwtService, reflector, configService);
  });

  const mockContext = (headers = {}, cookies = {}): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          cookies,
        }),
      }),
    }) as any;

  it('permite el acceso si la ruta es @Public()', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = mockContext();

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('arroja 401 si no hay cookies ni cabecera Authorization', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = mockContext();

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('arroja 401 si el token no es de tipo ACCESS', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'a@b.com',
      tokenType: 'REFRESH',
    });

    const ctx = mockContext({}, { riwi_access_token: 'fake-token' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('permite el acceso y puebla request.user con token ACCESS válido', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockResolvedValue({
      sub: 10,
      email: 'user@test.com',
      role: 'cliente',
      tokenType: 'ACCESS',
    });

    const req: any = {
      headers: {},
      cookies: { riwi_access_token: 'valid-jwt' },
    };
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => req }),
    } as any;

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(req.user).toEqual({
      id: 10,
      email: 'user@test.com',
      role: 'cliente',
      tokenType: 'ACCESS',
    });
  });
});
