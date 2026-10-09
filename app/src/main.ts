// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';
import { CSRF_COOKIE_NAME } from './common/constants/cookie.constant.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);

  // Enable cookies
  app.use(cookieParser());

  // Enable CSRF protection with csurf
  const isProduction = process.env.NODE_ENV === 'production';
  const csrfProtection = csurf({
    cookie: {
      key: CSRF_COOKIE_NAME,
      sameSite: 'lax',
      secure: isProduction,
      httpOnly: false,
    },
    value: (req: Request): string => {
      const headerVal =
        req.headers['x-csrf-token'] ||
        req.headers['csrf-token'] ||
        req.headers['xsrf-token'];
      if (typeof headerVal === 'string') return headerVal;
      if (Array.isArray(headerVal) && headerVal[0]) return headerVal[0];
      const body = req.body as Record<string, unknown> | undefined;
      if (body && typeof body._csrf === 'string') return body._csrf;
      return '';
    },
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    // Métodos seguros (GET, HEAD, OPTIONS) ejecutan csurf para adjuntar req.csrfToken()
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return csrfProtection(req, res, next);
    }

    // Endpoints exentos de verificación obligatoria de token CSRF (health checks y registro)
    const exemptPaths = ['/health', '/api/v1/health', '/api/v1/auth/register'];
    if (exemptPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    return csrfProtection(req, res, next);
  });

  // Enable CORS with credentials for cookies & CSRF headers
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'x-csrf-token',
    ],
  });

  // Global URI prefix for API
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/(.*)'],
  });

  // Global DTO validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Riwi Cine API')
    .setDescription(
      'API REST para la plataforma Multicine: cartelera, funciones, salas, reservas concurrentes, carrito y órdenes.',
    )
    .setVersion('1.0')
    .addCookieAuth('riwi_access_token')
    .addApiKey(
      { type: 'apiKey', name: 'x-csrf-token', in: 'header' },
      'CSRF-Token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(
    `Riwi Cine Backend (NestJS) running on port ${port} (API: /api/v1 | Docs: /api/docs)`,
  );
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
