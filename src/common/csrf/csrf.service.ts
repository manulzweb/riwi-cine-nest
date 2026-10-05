// src/common/csrf/csrf.service.ts

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Response } from 'express';
import { CSRF_COOKIE_NAME } from '../constants/cookie.constant';

@Injectable()
export class CsrfService {
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  setCsrfCookie(res: Response, token?: string): string {
    const csrfToken = token || this.generateToken();
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false, // Frontend must be able to read it to set X-CSRF-Token header
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return csrfToken;
  }
}
