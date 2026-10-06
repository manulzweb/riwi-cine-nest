// src/common/guards/roles.guard.spec.ts

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  const mockContext = (user?: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any;

  it('permite el acceso si la ruta no tiene roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('arroja 403 si el usuario no tiene rol asignado', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockContext({ id: 1 }))).toThrow(
      ForbiddenException,
    );
  });

  it('arroja 403 si el rol del usuario no coincide con el requerido', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() =>
      guard.canActivate(mockContext({ id: 1, role: 'cliente' })),
    ).toThrow(ForbiddenException);
  });

  it('permite el acceso si el rol del usuario coincide', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'cashier']);
    expect(guard.canActivate(mockContext({ id: 1, role: 'admin' }))).toBe(true);
  });
});
