// src/common/csrf/csrf.guard.ts

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '../constants/cookie.constant.js';
import { IS_PUBLIC_KEY } from '../constants/public-key.constant.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // 1. Safe HTTP methods do not mutate state
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // 2. Public endpoints (e.g., login, register, health checks) are excluded from CSRF check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 3. For state-mutating requests on authenticated routes, validate X-CSRF-Token against cookie
    const headerToken =
      request.headers[CSRF_HEADER_NAME] ||
      request.headers[CSRF_HEADER_NAME.toLowerCase()];
    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME];

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'AUTH_CSRF_INVALID',
        message: 'Token CSRF inválido o ausente',
      });
    }

    return true;
  }
}
