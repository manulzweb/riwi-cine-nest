import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App & Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health/live (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);

    const body = res.body as Record<string, unknown>;
    expect(body.status).toBe('ok');
    expect(body.uptime).toBeDefined();
  });

  it('/health/ready (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    const body = res.body as Record<string, unknown>;
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
  });
});
