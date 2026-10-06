// test/auth.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../src/common/constants/cookie.constant.js';

describe('Auth & Users (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const testUser = {
    email: `test_e2e_${uniqueSuffix}@riwicine.com`,
    password: 'Password123!',
    firstName: 'Juan',
    lastName: 'Pérez',
    documentType: 'CC',
    documentNumber: `100200${uniqueSuffix.toString().slice(-4)}`,
    birthDate: '1995-05-15',
    phone: '3001234567',
    personalDataConsent: true,
    termsConsent: true,
    commercialConsent: false,
  };

  let clientCookies: string[] = [];
  let _registeredAccessToken: string = '';
  let registeredRefreshToken: string = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'health/(.*)'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/v1/auth/csrf -> debe generar token CSRF y cookie', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/csrf')
      .expect(200);

    expect(res.body.csrfToken).toBeDefined();
    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie).toBeDefined();
    expect(setCookie.some((c: string) => c.includes('riwi_csrf_token'))).toBe(
      true,
    );
  });

  it('2. POST /api/v1/auth/register -> debe registrar un usuario y entregar cookies HttpOnly', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.message).toBe('Usuario registrado exitosamente');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tokens.refreshToken).toBeDefined();

    _registeredAccessToken = res.body.tokens.accessToken;
    registeredRefreshToken = res.body.tokens.refreshToken;

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie).toBeDefined();
    clientCookies = setCookie.map((c) => c.split(';')[0]);

    expect(clientCookies.some((c) => c.includes(ACCESS_TOKEN_COOKIE))).toBe(
      true,
    );
    expect(clientCookies.some((c) => c.includes(REFRESH_TOKEN_COOKIE))).toBe(
      true,
    );
  });

  it('3. GET /api/v1/users/me -> debe responder 200 con cookie de autenticación válida', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Cookie', clientCookies)
      .expect(200);

    expect(res.body.email).toBe(testUser.email);
    expect(res.body.role.name).toBe('cliente');
    expect(res.body.profile.firstName).toBe(testUser.firstName);
  });

  it('4. GET /api/v1/users/me -> debe responder 401 si no se envían cookies ni token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(401);

    expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('5. GET /api/v1/users -> debe responder 403 Forbidden para rol "cliente" (requiere admin)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Cookie', clientCookies)
      .expect(403);

    expect(res.body.code).toBe('FORBIDDEN_ROLE');
  });

  it('6. POST /api/v1/auth/refresh -> debe rotar el refresh token y emitir nuevas cookies', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', clientCookies)
      .expect(200);

    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tokens.refreshToken).toBeDefined();
    expect(res.body.tokens.refreshToken).not.toBe(registeredRefreshToken);

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie).toBeDefined();
    clientCookies = setCookie.map((c) => c.split(';')[0]);
  });

  it('7. Detección de reuso de token -> intentar usar token viejo revocado debe fallar con 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: registeredRefreshToken })
      .expect(401);

    expect(res.body.code).toBe('AUTH_TOKEN_REVOKED');
  });

  it('8. POST /api/v1/auth/logout -> debe revocar token y limpiar cookies', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', clientCookies)
      .expect(200);

    expect(res.body.message).toBe('Sesión cerrada exitosamente');
    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie.some((c) => c.includes(`${ACCESS_TOKEN_COOKIE}=;`))).toBe(
      true,
    );
  });

  it('9. POST /api/v1/auth/login -> credenciales válidas deben autenticar y poblar cookies', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body.message).toBe('Inicio de sesión exitoso');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.tokens.accessToken).toBeDefined();

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie.some((c) => c.includes(ACCESS_TOKEN_COOKIE))).toBe(true);
  });

  it('10. POST /api/v1/auth/login -> contraseña incorrecta debe fallar con 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      })
      .expect(401);

    expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
  });
});
