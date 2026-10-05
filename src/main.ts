// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);

  // Enable cookies
  app.use(cookieParser());

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
