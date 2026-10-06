// src/common/guards/auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../constants/cookie.constant.js';
import { IS_PUBLIC_KEY } from '../constants/public-key.constant.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'No se proporcionó un token de acceso válido',
      });
    }

    try {
      const secret = this.configService.get<string>('jwt.accessSecret');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (payload.tokenType !== 'ACCESS') {
        throw new UnauthorizedException({
          statusCode: 401,
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Tipo de token inválido para este recurso',
        });
      }

      (request as any).user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tokenType: payload.tokenType,
      };

      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException({
        statusCode: 401,
        code:
          err.name === 'TokenExpiredError'
            ? 'AUTH_TOKEN_EXPIRED'
            : 'AUTH_INVALID_CREDENTIALS',
        message:
          err.name === 'TokenExpiredError'
            ? 'El token de acceso ha expirado'
            : 'Token de acceso inválido',
      });
    }
  }

  private extractToken(request: Request): string | undefined {
    // 1. Primary: HttpOnly cookie
    if (request.cookies?.[ACCESS_TOKEN_COOKIE]) {
      return request.cookies[ACCESS_TOKEN_COOKIE];
    }
    // 2. Secondary fallback: Authorization Bearer header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }
}
